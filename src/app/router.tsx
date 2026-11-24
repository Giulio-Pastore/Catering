import { AdminPage } from '../pages/admin/AdminPage'
import { BookingLayout } from '../pages/booking/BookingLayout'
import { PackageStep } from '../pages/booking/PackageStep'
import { DetailsStep } from '../pages/booking/DetailsStep'
import { DishesStep } from '../pages/booking/DishesStep'
import { PaymentStep } from '../pages/booking/PaymentStep'
import { ConfirmStep } from '../pages/booking/ConfirmStep'
import { LandingPage } from '../pages/LandingPage'
import { SiteLayout } from '../components/layout/SiteLayout'
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: 'prenota',
        element: <BookingLayout />,
        children: [
          { index: true, element: <PackageStep /> },
          { path: 'dettagli', element: <DetailsStep /> },
          { path: 'piatti', element: <DishesStep /> },
          { path: 'pagamento', element: <PaymentStep /> },
          { path: 'conferma', element: <ConfirmStep /> },
        ],
      },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
])