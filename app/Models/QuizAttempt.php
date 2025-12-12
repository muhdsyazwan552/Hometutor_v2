<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    protected $table = 'quiz_attempts';
    
    protected $fillable = [
        'user_id',
        'parent_id',
        'question_id',
        'topic_id',
        'subtopic_id',
        'choosen_answer_id', // Note the spelling: "choosen" not "chosen"
        'answer_status',
        'subjective_answer',
        'session_id',
        'time_taken',
        'question_type_id'
    ];
    
    protected $casts = [
        'time_taken' => 'integer',
        'answer_status' => 'integer',
        'question_type_id' => 'integer'
    ];
    
    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function question()
    {
        return $this->belongsTo(Question::class);
    }
    
    public function chosenAnswer() // Make sure this matches the column name
    {
        // If column is "choosen_answer_id" (with double 'o'), use that
        return $this->belongsTo(Answer::class, 'choosen_answer_id');
    }
    
    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }
    
    public function subtopic()
    {
        return $this->belongsTo(Topic::class, 'subtopic_id');
    }
    
    public function session()
    {
        return $this->belongsTo(PracticeSession::class, 'session_id');
    }
    
    // Scopes
    public function scopeObjective($query)
    {
        return $query->where('question_type_id', 1);
    }
    
    public function scopeSubjective($query)
    {
        return $query->where('question_type_id', 2);
    }
    
    public function scopeCorrect($query)
    {
        return $query->where('answer_status', 1);
    }
    
    public function scopeWrong($query)
    {
        return $query->where('answer_status', 0);
    }
    
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
    
    // Helper methods
    public function isCorrect()
    {
        return $this->answer_status == 1;
    }
    
    public function isObjective()
    {
        return $this->question_type_id == 1;
    }
    
    public function isSubjective()
    {
        return $this->question_type_id == 2;
    }
}