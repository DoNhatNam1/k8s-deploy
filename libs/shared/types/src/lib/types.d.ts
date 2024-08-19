type SignupType = {
  fullName: string;
  phone_number: number;
  area: string;
  country: string;
};

type AccountType = {
  phone_number: number;
  password: string;
  role: 'Admin' | 'Agency' | 'SubAccount';
};

type RouteActionTypes = 'default' | 'btn1000' | 'btn3000' | 'btn10000';

export type { SignupType, AccountType, RouteActionTypes };
