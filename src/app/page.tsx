import { redirect } from 'next/navigation';

// Middleware handles the redirect based on role.
// This file is only reached if middleware is bypassed (shouldn't happen).
export default function Home() {
  redirect('/login');
}
