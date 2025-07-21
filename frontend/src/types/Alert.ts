export interface Alert {
  _id?: string;
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number;
  // User information
  user?: string; // User ID reference
  userName?: string;
  userContact?: string;
  createdAt?: Date;
}
