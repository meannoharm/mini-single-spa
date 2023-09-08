export interface AnyObject {
  [key: string]: any
}

export enum AppStatus {
  BEFORE_BOOTSTRAP = 'BEFORE_BOOTSTRAP',
  BOOTSTRAPPED = 'BOOTSTRAPPED',
  BEFORE_MOUNT = 'BEFORE_MOUNT',
  MOUNTED = 'MOUNTED',
  BEFORE_UNMOUNT = 'BEFORE_UNMOUNT',
  UNMOUNTED = 'UNMOUNTED',
  BOOTSTRAP_ERROR = 'BOOTSTRAP_ERROR',
  MOUNT_ERROR = 'MOUNT_ERROR',
  UNMOUNT_ERROR = 'UNMOUNT_ERROR',
}

export interface Application {
  name: string
  activeRule: Function | string
  props: AnyObject | Function
  pageEntry: string
  pageBody: string
  loadedURLs: string[]
  status?: AppStatus
  container: HTMLElement
  bootstrap?: (props: AnyObject) => Promise<any>
  mount?: (props: AnyObject) => Promise<any>
  unMount?: (props: AnyObject) => Promise<any>
}

export interface Source {
  isGlobal: boolean
  url?: string
  value: string;
  type?: string | null;
}