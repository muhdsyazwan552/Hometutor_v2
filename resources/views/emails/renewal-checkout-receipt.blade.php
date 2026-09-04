<!DOCTYPE html>
<html lang="en">
<body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a">
<div style="max-width:620px;margin:32px auto;background:#fff;border-radius:18px;padding:32px">
    <h1 style="margin:0;color:#082c58">Renewal payment receipt</h1>
    <p style="line-height:1.7">Your HomeTutor renewal payment has been recorded. Use the activation code below to renew the selected child.</p>
    <div style="margin:22px 0;padding:18px;border-radius:14px;background:#e0f2fe">
        <p style="margin:0 0 8px"><strong>Receipt:</strong> {{ $payment->provider_reference }}</p>
        <p style="margin:0 0 8px"><strong>Child:</strong> {{ $student->full_name ?: $student->user?->name }} ({{ $student->user?->username }})</p>
        <p style="margin:0 0 8px"><strong>Level:</strong> {{ $student->level?->name ?? 'Not set' }}</p>
        <p style="margin:0 0 8px"><strong>Package:</strong> {{ $payment->package->name }}</p>
        <p style="margin:0 0 8px"><strong>Duration:</strong> {{ $durationOption->months }} months ({{ $durationOption->duration_days }} days)</p>
        <p style="margin:0"><strong>Total:</strong> {{ $payment->currency }} {{ number_format($payment->amount, 2) }}</p>
    </div>
    <div style="margin:22px 0;padding:20px;border-radius:14px;background:#fff7ed;text-align:center">
        <p style="margin:0 0 8px;color:#9a3412;font-weight:bold">Renewal activation code</p>
        <p style="margin:0;font-family:monospace;font-size:20px;font-weight:bold;color:#082c58">{{ $activationCode->code_value }}</p>
    </div>
    <p style="line-height:1.7">Open the child renewal page, enter this code, and select <strong>Redeem and renew</strong>. Any remaining active days will be preserved.</p>
    <p style="font-size:13px;color:#64748b">This code is restricted to the child shown above and can only be redeemed once. Keep this email as your receipt.</p>
</div>
</body>
</html>
