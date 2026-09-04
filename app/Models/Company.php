<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'reference_code', 'code_series', 'is_default', 'is_active'];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function activationCodeBatches()
    {
        return $this->hasMany(ActivationCodeBatch::class);
    }

    public static function default(): self
    {
        return static::query()->where('is_default', true)->where('is_active', true)->firstOrFail();
    }
}
