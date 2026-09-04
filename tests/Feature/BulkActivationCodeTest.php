<?php

namespace Tests\Feature;

use App\Models\ActivationCode;
use App\Models\ActivationCodeBatch;
use App\Models\Company;
use App\Models\Package;
use App\Models\PackageDurationOption;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BulkActivationCodeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Schema::create('level', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        DB::table('level')->insert(['id' => 1, 'name' => 'Standard 1', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
    }

    public function test_code_manager_can_generate_and_export_company_batch(): void
    {
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);
        $company = Company::query()->where('name', 'Explode')->firstOrFail();
        [$package, $option] = $this->packageWithOption();

        $this->actingAs($manager)->post(route('code-manager.batches.store'), [
            'source_type' => 'company',
            'company_id' => $company->id,
            'package_id' => $package->id,
            'duration_months' => 6,
            'quantity' => 10,
            'series_prefix' => 'XCLN',
        ])->assertRedirect(route('code-manager.index'));

        $batch = ActivationCodeBatch::firstOrFail();
        $this->assertSame($company->id, $batch->company_id);
        $this->assertSame('XCLN', $batch->series_prefix);
        $this->assertSame(10, $batch->quantity);
        $this->assertDatabaseCount('activation_codes', 10);
        $this->assertSame(10, ActivationCode::query()->where('activation_code_batch_id', $batch->id)->where('duration_days', 183)->count());
        $this->assertSame(10, ActivationCode::query()->where('activation_code_batch_id', $batch->id)->where('series_prefix', 'XCLN')->count());
        $this->assertStringStartsWith('XCLN-', $batch->activationCodes()->firstOrFail()->code_value);

        $response = $this->actingAs($manager)->get(route('code-manager.batches.export', $batch));
        $response->assertOk()->assertDownload(strtolower($batch->reference).'.csv');
        $csv = $response->streamedContent();
        $this->assertStringContainsString('Activation Code', $csv);
        $this->assertStringContainsString($batch->activationCodes()->firstOrFail()->code_value, $csv);
    }

    public function test_code_manager_can_open_separate_bulk_and_per_person_pages(): void
    {
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);

        $this->actingAs($manager)->get(route('code-manager.bulk.index'))
            ->assertOk()->assertSee('Bulk activation-code generation')->assertSee('New code batch');
        $this->actingAs($manager)->get(route('code-manager.individual.index'))
            ->assertOk()->assertSee('Generate a personal activation code')->assertSee('Parent and licence details');
    }

    public function test_register_can_find_a_full_code_in_lowercase(): void
    {
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);
        [$package] = $this->packageWithOption();
        $code = app(\App\Services\ActivationCodeService::class)->issue($package, null, 'test', generatedBy: $manager, sendEmail: false);

        $this->actingAs($manager)->get(route('code-manager.register.index', ['search' => strtolower($code->code_value)]))
            ->assertOk()
            ->assertSee($code->code_value);
    }

    public function test_company_batch_code_can_be_used_by_any_parent(): void
    {
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);
        $explode = Company::query()->where('name', 'Explode')->firstOrFail();
        $dasarJati = Company::query()->where('name', 'Dasar Jati')->firstOrFail();
        $explodeParent = User::factory()->create(['role_id' => User::ROLE_PARENT, 'company_id' => $explode->id]);
        $otherParent = User::factory()->create(['role_id' => User::ROLE_PARENT, 'company_id' => $dasarJati->id]);
        [$package, $option] = $this->packageWithOption();

        $this->actingAs($manager)->post(route('code-manager.batches.store'), [
            'source_type' => 'company', 'company_id' => $explode->id, 'package_id' => $package->id,
            'duration_months' => 6, 'quantity' => 10,
        ])->assertRedirect();
        $code = ActivationCode::firstOrFail();

        $this->actingAs($otherParent)->postJson(route('parent.activation-codes.validate'), ['activation_code' => $code->code_value])
            ->assertOk()->assertJson(['valid' => true]);

        $this->actingAs($explodeParent)->postJson(route('parent.activation-codes.validate'), ['activation_code' => $code->code_value])
            ->assertOk()->assertJson(['valid' => true]);
    }

    public function test_event_batch_is_not_restricted_to_a_company(): void
    {
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);
        $parent = User::factory()->create(['role_id' => User::ROLE_PARENT, 'company_id' => Company::default()->id]);
        [$package, $option] = $this->packageWithOption();

        $this->actingAs($manager)->post(route('code-manager.batches.store'), [
            'source_type' => 'event', 'event_name' => 'Education Expo 2026', 'package_id' => $package->id,
            'duration_months' => 1, 'quantity' => 10,
        ])->assertRedirect();

        $batch = ActivationCodeBatch::firstOrFail();
        $this->assertNull($batch->company_id);
        $this->assertSame('Education Expo 2026', $batch->event_name);
        $this->actingAs($parent)->postJson(route('parent.activation-codes.validate'), ['activation_code' => ActivationCode::firstOrFail()->code_value])->assertOk();
    }

    public function test_code_manager_can_generate_one_thousand_codes_in_one_batch(): void
    {
        $manager = User::factory()->create(['role_id' => User::ROLE_CODE_MANAGER]);
        [$package, $option] = $this->packageWithOption();

        $this->actingAs($manager)->post(route('code-manager.batches.store'), [
            'source_type' => 'event', 'event_name' => 'Large School Campaign', 'package_id' => $package->id,
            'duration_months' => '12', 'quantity' => '1000',
        ])->assertRedirect(route('code-manager.index'));

        $this->assertDatabaseCount('activation_codes', 1000);
        $this->assertDatabaseCount('activation_code_attempts', 1000);
        $this->assertSame(1000, ActivationCodeBatch::firstOrFail()->activationCodes()->count());
    }

    private function packageWithOption(): array
    {
        $package = Package::create(['name' => 'Standard 1–3', 'code' => 'BULK-STD', 'curriculum_group' => 'standard_1_3', 'price' => 500, 'currency' => 'MYR', 'duration_days' => 365, 'max_children' => 1, 'is_active' => true]);
        $package->levels()->sync([1]);
        $option = PackageDurationOption::create(['package_id' => $package->id, 'months' => 6, 'duration_days' => 183, 'price' => 500, 'currency' => 'MYR', 'is_active' => true]);

        return [$package, $option];
    }
}
