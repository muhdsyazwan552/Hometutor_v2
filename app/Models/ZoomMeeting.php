<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ZoomMeeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'zoom_meeting_id',
        'passcode',
        'starts_at',
        'ends_at',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'passcode' => 'encrypted',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isJoinableAt(CarbonInterface $time): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $opensAt = $this->starts_at->copy()->subMinutes(
            config('zoom.join_window.minutes_before', 15)
        );
        $closesAt = $this->ends_at->copy()->addMinutes(
            config('zoom.join_window.minutes_after', 30)
        );

        return $time->betweenIncluded($opensAt, $closesAt);
    }
}
