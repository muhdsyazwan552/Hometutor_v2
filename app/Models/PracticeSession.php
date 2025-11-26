<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PracticeSession extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'practice_session';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'subject_id',
        'topic_id',
        'subtopic_id',
        'question_type_id',
        'total_correct',
        'total_skipped',
        'score',
        'start_at',
        'end_at',
        'total_time_seconds',

    ];

     protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    public function topic()
{
    return $this->belongsTo(Topic::class, 'topic_id');
}

public function subtopic()
{
    return $this->belongsTo(Topic::class, 'subtopic_id');
}

public function subject()
{
    return $this->belongsTo(Subject::class);
}

public function user()
{
    return $this->belongsTo(User::class);
}

}