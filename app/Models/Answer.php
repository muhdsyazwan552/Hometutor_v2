<?php
// app/Models/Answer.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Answer extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'answers';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'answer_text',
        'answer_option_file',
        'iscorrectanswer',
        'sample_answer',
        'sample_answer_file',
        'reason',
        'reason2',
        'reason_file',
        'question_id',
        'seq',
        'isactive',
        'ispublished',
        'approval_status',
        'item_status',
        'created_by',
        'modified_by',
        'published_by',
        'moderated_by',
        'published_at',
        'approval_status_at'
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = [
        'iscorrectanswer' => 'boolean',
        'isactive' => 'boolean',
        'ispublished' => 'boolean',
        'approval_status' => 'boolean',
        'item_status' => 'boolean',
        'published_at' => 'datetime',
        'approval_status_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the question that owns this answer.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    /**
     * Scope active answers.
     */
    public function scopeActive($query)
    {
        return $query;
    }

    /**
     * Scope published answers.
     */
    public function scopePublished($query)
    {
        return $query->where('ispublished', 1);
    }

    /**
     * Scope correct answers.
     */
    public function scopeCorrect($query)
    {
        return $query->where('iscorrectanswer', 1);
    }

    /**
     * Scope answers by sequence order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('seq', 'asc');
    }
}