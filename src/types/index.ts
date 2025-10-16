export interface PageData {
  id: string;
  title: string;
  slug?: string; // Custom URL slug (optional, e.g., "miapagina")
  author: string;
  createdAt: number;
  updatedAt: number;
}

export interface ComponentData {
  type: ComponentType;
  id: string;
  order: number;
  content?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  src?: string;
  name?: string;
  description?: string;
  avatar?: string;
  title?: string;
  url?: string;
  icon?: string;
  height?: string;
  template?: string;
  html?: string;
  css?: string;
  js?: string;
  deleted?: boolean;
  deletedAt?: number;
}

export type ComponentType = 
  | 'h1'
  | 'p'
  | 'img'
  | 'avatar'
  | 'link'
  | 'spacer'
  | 'code';

export interface UserInfo {
  sea: {
    pub: string;
  };
  alias: string;
  pub: string;
}

export interface ShogunCoreInstance {
  db: any;
  login: (username: string, password: string) => Promise<any>;
  signUp: (username: string, password: string) => Promise<any>;
  logout: () => void;
  isLoggedIn: () => boolean;
  getCurrentUser: () => any;
}

export interface CodeTemplate {
  html: string;
  css: string;
  js: string;
}

export interface CodeTemplates {
  [key: string]: CodeTemplate;
}

