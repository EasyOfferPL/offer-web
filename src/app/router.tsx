import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AnalyticsLandingPage } from '../pages/AnalyticsLandingPage'
import { CompletenessPage } from '../pages/CompletenessPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OfferDetailsPage } from '../pages/OfferDetailsPage'
import { OffersPage } from '../pages/OffersPage'
import { SalariesPage } from '../pages/SalariesPage'
import { TechnologyPopularityPage } from '../pages/TechnologyPopularityPage'
import { TechnologyTrendPage } from '../pages/TechnologyTrendPage'
import { UiStatesPage } from '../pages/UiStatesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/offers" replace /> },
      { path: 'offers', element: <OffersPage /> },
      { path: 'offers/:offerId', element: <OfferDetailsPage /> },
      { path: 'analytics', element: <AnalyticsLandingPage /> },
      { path: 'analytics/technologies', element: <TechnologyPopularityPage /> },
      { path: 'analytics/technologies/trend', element: <TechnologyTrendPage /> },
      { path: 'analytics/salaries', element: <SalariesPage /> },
      { path: 'analytics/completeness', element: <CompletenessPage /> },
      // Development-only route demonstrating shared request states (FE-007).
      ...(import.meta.env.DEV
        ? [{ path: 'dev/ui-states', element: <UiStatesPage /> }]
        : []),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
