<!DOCTYPE html>
<html lang="en">
<body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a">
<div style="max-width:600px;margin:32px auto;background:#fff;border-radius:18px;padding:32px">
    <h1 style="margin:0;color:#082c58">HomeTutor activation code</h1>
    <p style="line-height:1.7">Your child activation code is ready.</p>
    <div style="margin:24px 0;padding:20px;border-radius:14px;background:#e0f2fe;text-align:center;font-size:24px;font-weight:700;letter-spacing:2px;color:#075985">{{ $activationCode->code_value }}</div>
    <p><strong>Package:</strong> {{ $activationCode->package->name }}</p>
    <p><strong>Use:</strong> {{ $activationCode->intended_use === 'renewal' ? 'Renew existing child account' : ($activationCode->intended_use === 'new' ? 'Create a new child account' : 'New account or renewal') }}</p>
    @if($activationCode->renewalChild)<p><strong>Renewal child:</strong> {{ $activationCode->renewalChild->name }} ({{ $activationCode->renewalChild->username }})</p>@endif
    <p><strong>Code expires:</strong> {{ $activationCode->expires_at?->format('d M Y, H:i') }}</p>
    <p style="line-height:1.7">Enter this code when creating a child account or renewing an existing child. The code can only be redeemed once.</p>
    <p style="font-size:13px;color:#64748b">If you did not request this code, contact HomeTutor support.</p>
</div>
</body>
</html>
