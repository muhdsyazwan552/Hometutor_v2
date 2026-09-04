<?php

namespace App\Support;

class QuestionContentNormalizer
{
    private const LEGACY_IMAGE_BASE = 'https://hometutor.com.my/main/simpana/images';

    private const QUESTION_FILE_BASE = 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/questions';

    public static function questionFileUrl(?string $filename): ?string
    {
        $filename = trim((string) $filename);

        if ($filename === '') {
            return null;
        }

        if (preg_match('#^(?:https?://|data:|/)#i', $filename)) {
            return $filename;
        }

        if (str_starts_with($filename, 'questions/')) {
            return 'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/' . ltrim($filename, '/');
        }

        return self::QUESTION_FILE_BASE . '/' . ltrim($filename, '/');
    }

    public static function normalizeHtml(?string $html): ?string
    {
        if ($html === null || $html === '') {
            return $html;
        }

        return preg_replace_callback(
            '/\[IMG_PATH_FILE\]((\d+)-[^"\'<>\s]+)/i',
            function (array $matches) {
                $filename = $matches[1];
                $digitPath = implode('/', str_split($matches[2]));

                return self::LEGACY_IMAGE_BASE . '/' . $digitPath . '/' . $filename;
            },
            $html
        );
    }

    public static function questionHtml(?string $html, ?string $questionFile = null): ?string
    {
        $normalizedHtml = self::normalizeHtml($html) ?? '';
        $fileUrl = self::questionFileUrl($questionFile);

        if ($fileUrl && !str_contains($normalizedHtml, basename($fileUrl))) {
            $escapedUrl = htmlspecialchars($fileUrl, ENT_QUOTES, 'UTF-8');
            $normalizedHtml .= '<p><img src="' . $escapedUrl . '" alt="Question image" /></p>';
        }

        return $normalizedHtml !== '' ? $normalizedHtml : null;
    }
}
