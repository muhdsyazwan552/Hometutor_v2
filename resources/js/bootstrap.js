import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Laravel Echo for real-time features
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Only initialize Echo if Pusher credentials are available
// if (import.meta.env.VITE_PUSHER_APP_KEY) {
//     window.Pusher = Pusher;
    
//     window.Echo = new Echo({
//         broadcaster: 'pusher',
//         key: import.meta.env.VITE_PUSHER_APP_KEY,
//         cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
//         forceTLS: true,
//         enabledTransports: ['ws', 'wss']
//     });
    
//     console.log('Echo initialized successfully');
// } else {
//     console.warn('Pusher credentials not found - real-time features disabled');
//     // Create a mock Echo object to prevent errors
//     window.Echo = {
//         join: () => ({
//             here: () => {},
//             joining: () => {},
//             leaving: () => {},
//             listen: () => {},
//             stopListening: () => {}
//         }),
//         private: () => ({
//             listen: () => {}
//         }),
//         channel: () => ({
//             listen: () => {}
//         })
//     };
// }