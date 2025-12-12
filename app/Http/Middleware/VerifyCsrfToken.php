<?php
// app/Http/Middleware/VerifyCsrfToken.php
namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Anda bisa exclude routes tertentu di sini jika perlu
        // '/stripe/webhook',
        // '/change-language', // JANGAN exclude ini, kita mau CSRF protection
    ];
}