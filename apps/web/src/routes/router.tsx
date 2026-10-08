import { createBrowserRouter } from "react-router-dom";
import { RequireSession } from "./require-session";
import { AllocationPage } from "../pages/allocation/allocation-page";
import { GroupPage } from "../pages/group/group-page";
import { HomePage } from "../pages/home/home-page";
import { InvoiceDetailPage } from "../pages/invoices/invoice-detail-page";
import { InvoicesPage } from "../pages/invoices/invoices-page";
import { LoginPage } from "../pages/login/login-page";
import { MypagePage } from "../pages/mypage/mypage-page";
import { RecordsPage } from "../pages/records/records-page";
import { RecordDetailPage } from "../pages/records/record-detail-page";
import { WalletsPage } from "../pages/wallets/wallets-page";

export const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  {
    element: <RequireSession />,
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/records", element: <RecordsPage /> },
      { path: "/records/:withdrawalId", element: <RecordDetailPage /> },
      {
        path: "/records/:withdrawalId/claims/new",
        element: <AllocationPage />,
      },
      { path: "/invoices", element: <InvoicesPage /> },
      { path: "/invoices/:claimId", element: <InvoiceDetailPage /> },
      { path: "/mypage", element: <MypagePage /> },
      { path: "/wallets", element: <WalletsPage /> },
      { path: "/group", element: <GroupPage /> },
    ],
  },
]);
