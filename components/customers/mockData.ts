// Design-only placeholder data — no backend/API wiring. Shared between
// CustomersList and CustomerEdit so an edit link opens the matching record.

export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  division?: string;
  district?: string;
  upazila?: string;
  postOffice?: string;
  postCode?: string;
  area?: string;
  zone?: string;
  status: CustomerStatus;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
}

export const BD_DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
] as const;

export const DELIVERY_ZONES = ["Inside Dhaka", "Outside Dhaka"] as const;

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1",
    firstName: "Rahim",
    lastName: "Uddin",
    email: "rahim@example.com",
    phone: "+8801711111111",
    division: "Dhaka",
    district: "Dhaka",
    area: "Uttara",
    zone: "Inside Dhaka",
    status: "active",
    totalOrders: 8,
    totalSpent: 12400,
    joinedAt: "2026-03-14T10:00:00.000Z",
  },
  {
    id: "2",
    firstName: "Karim",
    lastName: "Hossain",
    email: "karim@example.com",
    phone: "+8801822222222",
    division: "Dhaka",
    district: "Dhaka",
    area: "Mirpur",
    zone: "Inside Dhaka",
    status: "active",
    totalOrders: 3,
    totalSpent: 4200,
    joinedAt: "2026-04-02T09:15:00.000Z",
  },
  {
    id: "3",
    firstName: "Jamal",
    lastName: "Ahmed",
    email: "jamal@example.com",
    phone: "+8801933333333",
    companyName: "Aqua World BD",
    division: "Chattogram",
    district: "Chattogram",
    area: "Agrabad",
    zone: "Outside Dhaka",
    status: "active",
    totalOrders: 15,
    totalSpent: 28900,
    joinedAt: "2026-01-20T14:30:00.000Z",
  },
  {
    id: "4",
    firstName: "Nusrat",
    lastName: "Jahan",
    email: "nusrat@example.com",
    phone: "+8801644444444",
    division: "Dhaka",
    district: "Dhaka",
    area: "Dhanmondi",
    zone: "Inside Dhaka",
    status: "inactive",
    totalOrders: 1,
    totalSpent: 850,
    joinedAt: "2026-05-11T08:45:00.000Z",
  },
  {
    id: "5",
    firstName: "Sabbir",
    lastName: "Islam",
    email: "sabbir@example.com",
    phone: "+8801555555555",
    division: "Rajshahi",
    district: "Rajshahi",
    area: "Shaheb Bazar",
    zone: "Outside Dhaka",
    status: "active",
    totalOrders: 5,
    totalSpent: 7600,
    joinedAt: "2026-02-28T16:20:00.000Z",
  },
  {
    id: "6",
    firstName: "Tania",
    lastName: "Akter",
    email: "tania@example.com",
    phone: "+8801366666666",
    division: "Dhaka",
    district: "Dhaka",
    area: "Gulshan",
    zone: "Inside Dhaka",
    status: "active",
    totalOrders: 11,
    totalSpent: 19850,
    joinedAt: "2026-01-05T11:10:00.000Z",
  },
  {
    id: "7",
    firstName: "Farhan",
    lastName: "Kabir",
    email: "farhan@example.com",
    phone: "+8801777777777",
    division: "Khulna",
    district: "Khulna",
    area: "Sonadanga",
    zone: "Outside Dhaka",
    status: "inactive",
    totalOrders: 2,
    totalSpent: 1500,
    joinedAt: "2026-06-01T13:00:00.000Z",
  },
  {
    id: "8",
    firstName: "Mitu",
    lastName: "Rahman",
    email: "mitu@example.com",
    phone: "+8801888888888",
    division: "Dhaka",
    district: "Dhaka",
    area: "Banani",
    zone: "Inside Dhaka",
    status: "active",
    totalOrders: 6,
    totalSpent: 9300,
    joinedAt: "2026-03-30T07:40:00.000Z",
  },
  {
    id: "9",
    firstName: "Sadia",
    lastName: "Islam",
    email: "sadia@example.com",
    phone: "+8801999999999",
    division: "Sylhet",
    district: "Sylhet",
    area: "Zindabazar",
    zone: "Outside Dhaka",
    status: "active",
    totalOrders: 4,
    totalSpent: 5200,
    joinedAt: "2026-04-18T19:55:00.000Z",
  },
  {
    id: "10",
    firstName: "Hasan",
    lastName: "Mahmud",
    email: "hasan@example.com",
    phone: "+8801611111111",
    division: "Dhaka",
    district: "Dhaka",
    area: "Uttara",
    zone: "Inside Dhaka",
    status: "active",
    totalOrders: 9,
    totalSpent: 15600,
    joinedAt: "2026-02-09T12:05:00.000Z",
  },
];
