export enum RolesEnum {
  REFECTORY_MANAGER = 'refectory_manager',
  MURAL_MANAGER = 'mural_manager',
  PERMISSION_MANAGER = 'permission_manager',
}

export enum UserType {
  STUDENT = 'student',
  EMPLOYEE = 'employee',
  EXTERNAL = 'external',
}

export enum RefectoryStatusEnum {
  OPEN = 'open',
  CREATED = 'created',
  CLOSED = 'closed',
}

export type RefectoryAnswerType = {
  _id: string;
  totalBreakfast: number;
  totalLunch: number;
  totalAfternoonSnack: number;
  totalDinner: number;
  totalNightSnack: number;
  status: string;
  vigencyDate: Date;
  closingDate: Date;
  startAnswersDate: Date;
  users: {
    name: string;
    breakfast: number;
    lunch: number;
    afternoonSnack: number;
    dinner: number;
    nightSnack: number;
  }[];
};
