<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    use HasFactory;

    protected $table = 'topics';

    protected $fillable = [
        'old_id',
        'name',
        'subject_id',
        'level_id',
        'parent_id',
        'group_id',
        'seq',
        'is_active',
        'is_published',
        'approval_status',
        'published_by',
        'moderated_by',
        'modified_by',
        'created_by',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_published' => 'boolean',
    ];

    /** 
     * Relationships
     */

    // Setiap topik milik satu subjek
public function subject()
{
    return $this->belongsTo(Subject::class, 'subject_id', 'id');
}

public function isSubtopic()
{
    return $this->parent_id != 0; // Check if parent_id is not 0
}

public function isMainTopic()
{
    return $this->parent_id == 0; // Check if parent_id is 0
}

// Relationships still work the same
public function parent()
{
    return $this->belongsTo(Topic::class, 'parent_id');
}

public function children()
{
    return $this->hasMany(Topic::class, 'parent_id');
}

}
