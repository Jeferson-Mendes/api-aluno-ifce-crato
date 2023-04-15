import { Refectory } from '../refectory/schemas/refectory.schema';
import { Communique } from '../communique/schemas/communique.schema';
import { User } from '../users/schemas/user.schema';

export enum RolesEnum {
  REFECTORY_MANAGER = 'refectory_manager',
  MURAL_MANAGER = 'mural_manager',
  PERMISSION_MANAGER = 'permission_manager',
}

export enum UserType {
  STUDENT = 'student',
  EMPLOYEE = 'employee',
}

export enum RefectoryStatusEnum {
  open = 'open',
  openToAnswer = 'openToAnswer',
  scheduled = 'scheduled',
  closed = 'closed',
}

type listTypes = Communique | Refectory | User;

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

export type PaginationResponseType = {
  list: listTypes[];
  resPerPage: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export type PaginationAttributes = {
  resPerPage: number;
  currentPage: number;
  skip: number;
};
