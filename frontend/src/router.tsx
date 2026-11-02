import { createBrowserRouter } from 'react-router'
import { AppShell } from './components/AppShell'
import { LoginPage } from './features/auth/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <PlaceholderPage messageKey="page.home" /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <PlaceholderPage /> },
      { path: '/forgot-password', element: <PlaceholderPage /> },
      { path: '/privacy', element: <PlaceholderPage /> },
      { path: '/terms', element: <PlaceholderPage /> },
      { path: '*', element: <PlaceholderPage messageKey="page.notFound" /> },
    ],
  },
])
