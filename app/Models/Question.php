<?php
// app/Models/Question.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Question extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'questions';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'question_code',
        'question_text',
        'question_file',
        'score',
        'passingscore',
        'topic_id',
        'question_type_id',
        'fkanswerinputtypeid',
        'difficulty_type_id',
        'source_reference_id',
        'parent_id',
        'seq',
        'sqvar',
        'is_active',
        'is_published',
        'approval_status',
        'item_status',
        'created_by',
        'updated_by',
        'published_by',
        'moderated_by',
        'published_at',
        'approval_status_at',
        'has_sample_answer',
        'has_reason'
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = [
        'score' => 'decimal:2',
        'passingscore' => 'decimal:2',
        'is_active' => 'boolean',
        'is_published' => 'boolean',
        'approval_status' => 'boolean',
        'item_status' => 'boolean',
        'has_sample_answer' => 'boolean',
        'has_reason' => 'boolean',
        'published_at' => 'datetime',
        'approval_status_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the answers for this question.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class, 'question_id');
    }

    /**
     * Get the correct answer for this question.
     */
    public function correctAnswer()
    {
        return $this->hasOne(Answer::class, 'question_id')->where('iscorrectanswer', true);
    }

    /**
     * Get the parent question (for sub-questions).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'parent_id');
    }

    /**
     * Get the child questions (sub-questions).
     */
    public function children(): HasMany
    {
        return $this->hasMany(Question::class, 'parent_id');
    }

    /**
     * Scope active questions.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }

    /**
     * Scope published questions.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', 1);
    }

    /**
     * Scope approved questions.
     */
    public function scopeApproved($query)
    {
        return $query->where('approval_status', 1);
    }

    /**
     * Scope questions by difficulty.
     */
    public function scopeByDifficulty($query, $difficultyTypeId)
    {
        return $query->where('difficulty_type_id', $difficultyTypeId);
    }

    /**
     * Scope questions by topic.
     */
    public function scopeByTopic($query, $topicId)
    {
        return $query->where('topic_id', $topicId);
    }

    /**
     * Scope questions by type.
     */
    public function scopeByType($query, $questionTypeId)
    {
        return $query->where('question_type_id', $questionTypeId);
    }
}