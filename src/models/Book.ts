// Book interface
export interface Book {
  id: string;
  title: string;
  authorId: string;
  year?: number;
  genre?: string;
  isbn?: string;
  createdAt: string;
  updatedAt: string;
}
