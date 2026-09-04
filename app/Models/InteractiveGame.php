<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InteractiveGame extends Model
{
    protected $fillable = [
        'level_id',
        'subject_id',
        'content_group',
        'slug',
        'title',
        'description',
        'launch_url',
        'thumbnail_url',
        'sequence',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sequence' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function level()
    {
        return $this->belongsTo(Level::class, 'level_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }
}
