<?php

namespace Tests\Unit;

use App\Support\QuestionContentNormalizer;
use PHPUnit\Framework\TestCase;

class QuestionContentNormalizerTest extends TestCase
{
    public function test_it_builds_the_legacy_digit_folder_image_url(): void
    {
        $html = '<p><img src="[IMG_PATH_FILE]000540-example.gif" /></p>';

        $this->assertSame(
            '<p><img src="https://hometutor.com.my/main/simpana/images/0/0/0/5/4/0/000540-example.gif" /></p>',
            QuestionContentNormalizer::normalizeHtml($html)
        );
    }

    public function test_it_builds_an_s3_url_for_a_question_filename(): void
    {
        $this->assertSame(
            'https://ptrs-elearning.s3.ap-southeast-1.amazonaws.com/questions/example.png',
            QuestionContentNormalizer::questionFileUrl('example.png')
        );
    }

    public function test_it_appends_a_separate_question_file_without_duplicating_an_embedded_file(): void
    {
        $combined = QuestionContentNormalizer::questionHtml('<p>Read this.</p>', 'example.png');
        $alreadyEmbedded = QuestionContentNormalizer::questionHtml(
            '<p><img src="https://example.test/example.png" /></p>',
            'example.png'
        );

        $this->assertStringContainsString('Read this.', $combined);
        $this->assertStringContainsString('/questions/example.png', $combined);
        $this->assertSame(1, substr_count($alreadyEmbedded, 'example.png'));
    }
}
