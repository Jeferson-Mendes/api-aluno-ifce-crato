import { Query } from 'express-serve-static-core';
import { PaginationAttributes } from 'src/ts/enums';

export const mountPaginationAttribute = (
  query: Query,
): PaginationAttributes => {
  const resPerPage = Number(query.resPerPage) || 10;
  const currentPage = Number(query.page) || 1;
  const skip = resPerPage * (currentPage - 1);

  return {
    currentPage,
    resPerPage,
    skip,
  };
};

export const generateCode = (): string => {
  const codigo = Math.floor(Math.random() * 9000) + 1000;
  return codigo.toString();
};

export const resetTime = (date: Date) => {
  date.setUTCHours(0);
  date.setUTCMinutes(0);
  date.setUTCSeconds(0);
  date.setUTCMilliseconds(0);

  return date;
};

export const changeTimeZone = (
  date: Date | string,
  options = { locale: 'pt-BR', timeZone: 'America/Sao_Paulo' },
) => {
  if (typeof date === 'string') {
    return new Date(
      new Date(date).toLocaleString(options.locale, {
        timeZone: options.timeZone,
      }),
    );
  }

  return new Date(
    date.toLocaleString(options.locale, {
      timeZone: options.timeZone,
    }),
  );
};
