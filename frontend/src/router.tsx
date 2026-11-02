import { createBrowserRouter, type RouteObject } from 'react-router'
import { AppShell } from './components/AppShell'
import { LoginPage } from './features/auth/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { PATHS } from './paths'

// Add every new page's path to PATHS first; routes.test.ts fails if one is missing.
export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: PATHS.home, element: <PlaceholderPage messageKey="page.home" /> },
      { path: PATHS.login, element: <LoginPage /> },
      { path: PATHS.register, element: <PlaceholderPage /> },
      { path: PATHS.forgotPassword, element: <PlaceholderPage /> },
      { path: PATHS.privacy, element: <PlaceholderPage /> },
      { path: PATHS.terms, element: <PlaceholderPage /> },
      { path: '*', element: <PlaceholderPage messageKey="page.notFound" /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
