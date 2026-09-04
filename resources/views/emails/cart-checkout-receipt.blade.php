<!DOCTYPE html>
<html lang="en">
<body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a">
<div style="max-width:680px;margin:32px auto;background:#fff;border-radius:18px;padding:32px">
    <h1 style="margin:0;color:#082c58">Combined payment receipt</h1>
    <p style="line-height:1.7">Your HomeTutor payment for {{ $order->items->count() }} child packages was completed successfully.</p>
    <div style="margin:22px 0;padding:18px;border-radius:14px;background:#e0f2fe">
        <p style="margin:0 0 8px"><strong>Order:</strong> {{ $order->order_number }}</p>
        <p style="margin:0 0 8px"><strong>Transaction:</strong> {{ $transaction->provider_transaction_reference }}</p>
        <p style="margin:0"><strong>Total paid:</strong> {{ $order->currency }} {{ number_format($order->total, 2) }}</p>
    </div>
    @foreach($order->items as $item)
        <div style="margin:14px 0;padding:16px;border:1px solid #e2e8f0;border-radius:12px">
            <p style="margin:0 0 7px"><strong>Child:</strong> {{ $item->fulfilledChild?->name }}</p>
            <p style="margin:0 0 7px"><strong>Username:</strong> {{ $item->fulfilledChild?->username }}</p>
            <p style="margin:0 0 7px"><strong>Level:</strong> {{ $item->fulfilledChild?->student?->level?->name ?? 'Not set' }}</p>
            <p style="margin:0 0 7px"><strong>Package:</strong> {{ $item->package_name_snapshot }}</p>
            <p style="margin:0"><strong>Duration:</strong> {{ $item->durationOption?->months }} months · {{ $item->currency }} {{ number_format($item->total, 2) }}</p>
        </div>
    @endforeach
    <p style="line-height:1.7;padding:12px;border-radius:10px;background:#fff7ed;color:#9a3412"><strong>Security:</strong> Child passwords are not included in email. Use the passwords entered when each package was added to the cart.</p>
    <p style="font-size:13px;color:#64748b">Keep this email as your combined receipt.</p>
</div>
</body>
</html>
