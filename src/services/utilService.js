const db = require('../config/db');
const { z } = require('zod');
const {
  filterableFields,
  searchableFields,
  filterableFieldsReview,
  filterableFieldsPromoted,
  filterableFieldsTopPerformers,
  searchfilterableFields,
  filterableFieldsTopProjects,
} = require('../config/common');
const PaginationSchema = z
  .object({
    page: z.coerce
      .number()
      .int()
      .positive('Page must be a positive integer')
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100, 'Max items per page is 100')
      .default(10),
  })
  .catchall(z.string());

const getList = function (req) {
  let result;
  let response;
  const queryObj = PaginationSchema.parse(req.query);
  const queryList = Object.entries(queryObj).filter(
    (it) =>
      it[0] !== 'page' &&
      it[0] !== 'limit' &&
      it[0] !== 'search' &&
      it[0] !== 'sortBy' &&
      it[0] !== 'order' &&
      it[0] !== 'tableType'
  );
  const map = new Map(queryList);
  for (let [key, value] of map) {
    if (value) map.set(key, value.split(','));
    else map.set(key, []);
  }
  const page = Number(queryObj?.page) || 1;
  const limit = Number(queryObj?.limit) || 10;
  const search = queryObj?.search || '';
  const order = queryObj?.order || 'asc';
  const sortBy = queryObj?.sortBy || 'id';
  const tableType = queryObj?.tableType || 'employees';
  const { employeeList } = db.get('employeeList').value();
  let totalItems;
  let totalPages;
  switch (tableType) {
    case 'employees':
      result = sortList(
        searchList(filterList(employeeList[0].employees, map), search),
        sortBy,
        order
      );
      totalItems = result.length;
      totalPages = Math.ceil(totalItems / limit);
      result = paginateList(result, page, limit);
      response = {
        employees: result,
        attritionInsights: employeeList[0].attritionInsights,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          search,
          sortBy,
          order,
          tableType,
        },
      };
      break;
    case 'topProjects':
      result = sortList(
        searchList(
          filterList(getTopProjects(employeeList[0].employees), map, true),
          search
        ),
        sortBy,
        order
      );
      totalItems = result.length;
      totalPages = Math.ceil(totalItems / limit);
      result = paginateList(result, page, limit);

      response = {
        employees: result,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          sortBy,
          order,
          tableType,
        },
      };
      break;
    default:
      const performanceCards = db.get('performanceCards').value();
      result = performanceCardsTable(performanceCards, queryObj, map);
      response = {
        ...result,
      };
      break;
  }

  return response;
};

const filterList = function (list, queryList, isTopProjects) {
  const filteredArray = [];
  let flag = 1;
  if (queryList.size === 0) return list;
  for (const item of list) {
    flag = 1;
    for (let [key, value] of queryList) {
      if (value.length === 0) continue;
      if (searchfilterableFields.has(key)) {
        let path = searchfilterableFields.get(key).split('$');
        path = isTopProjects ? [path[path.length - 1]] : path;
        const values = extract(item, path);
        if (Array.isArray(values)) {
          const match = value.filter((it) => values.includes(it));
          if (match.length === 0) {
            flag = 0;
            break;
          }
        } else {
          if (!value.includes(values)) {
            flag = 0;
            break;
          }
        }
      }
    }
    flag && filteredArray.push(item);
  }
  return filteredArray;
};

const searchList = function (list, searchKey) {
  const result = [];
  const cleanQuery = searchKey.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!cleanQuery) return list;
  for (const item of list) {
    if (search(item, cleanQuery)) result.push(item);
  }
  return result;
};

const search = function (item, cleanQuery) {
  for (const [key, value] of Object.entries(item)) {
    if (searchableFields.has(key)) {
      if (value.toString().toLowerCase().includes(cleanQuery)) return true;
    }
  }
  return false;
};

const sortList = function (list, sortBy, order) {
  if (!list.length) return list;
  list.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return order === 'asc' ? -1 : 1;
    else if (a[sortBy] > b[sortBy]) return order === 'asc' ? 1 : -1;

    return 0;
  });
  return list;
};

const paginateList = function (list, page, limit) {
  const offset = (page - 1) * limit;
  const endIndex = offset + limit;
  const finalList = list?.slice(offset, endIndex) ?? [];
  return finalList;
};

const performanceCardsTable = function (performanceCards, queryObj, map) {
  let response;
  let result;
  const {
    page,
    limit,
    search = '',
    order = 'asc',
    sortBy = 'id',
    tableType = 'employees',
  } = queryObj;

  let totalItems;
  let totalPages;

  switch (tableType) {
    case 'topPerformers':
      result = sortList(
        searchList(
          filterList(performanceCards['topPerformers'].employees, map),
          search
        ),
        sortBy,
        order
      );
      totalItems = result.length;
      totalPages = Math.ceil(totalItems / limit);
      result = paginateList(result, page, limit);
      response = {
        ...performanceCards['topPerformers'],
        employees: result,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          search,
          sortBy,
          order,
          tableType,
        },
      };
      break;
    case 'promotedThisYear':
      result = sortList(
        searchList(
          filterList(performanceCards['promotedThisYear'].employees, map),
          search
        ),
        sortBy,
        order
      );
      totalItems = result.length;
      totalPages = Math.ceil(totalItems / limit);
      result = paginateList(result, page, limit);
      response = {
        ...performanceCards['promotedThisYear'],
        employees: result,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          search,
          sortBy,
          order,
          tableType,
        },
      };
      break;
    case 'requiringReview':
      result = sortList(
        searchList(
          filterList(performanceCards['requiringReview'].employees, map),
          search
        ),
        sortBy,
        order
      );
      totalItems = result.length;
      totalPages = Math.ceil(totalItems / limit);
      result = paginateList(result, page, limit);
      response = {
        ...performanceCards['requiringReview'],
        employees: result,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          search,
          sortBy,
          order,
          tableType,
        },
      };
      break;
    default:
      break;
  }
  return response;
};

// extracting based on for ex: projects.projectName path
function extract(current, remainingKeys) {
  // Whatever we're standing on is the value to collect. Last item in the path.
  if (remainingKeys.length === 0) {
    if (current == null) return [];

    if (Array.isArray(current)) {
      return current.flatMap((item) => extract(item, []));
    }

    if (typeof current === 'object') {
      return [];
    }

    return [String(current)];
  }

  if (current == null) {
    return [];
  }

  if (Array.isArray(current)) {
    return current.flatMap((item) => extract(item, remainingKeys));
  }

  if (typeof current !== 'object') {
    return [];
  }

  const [key, ...rest] = remainingKeys;

  return extract(current[key], rest);
}

const fetchFiltersList = function (req) {
  const { tableType } = req.query;
  let filterKeys;
  let data;
  if (tableType === 'requiringReview') {
    const performanceCards = db.get('performanceCards').value();
    data = performanceCards['requiringReview'].employees;
    filterKeys = filterableFieldsReview;
  } else if (tableType === 'promotedThisYear') {
    const performanceCards = db.get('performanceCards').value();
    data = performanceCards['promotedThisYear'].employees;
    filterKeys = filterableFieldsPromoted;
  } else if (tableType === 'topPerformers') {
    const performanceCards = db.get('performanceCards').value();
    data = performanceCards['topPerformers'].employees;
    filterKeys = filterableFieldsTopPerformers;
  } else if (tableType === 'topProjects') {
    const { employeeList } = db.get('employeeList').value();
    data = employeeList[0].employees;
    filterKeys = filterableFieldsTopProjects;
  } else {
    const { employeeList } = db.get('employeeList').value();
    data = employeeList[0].employees;
    filterKeys = filterableFields;
  }

  const valuesMap = new Map();

  for (const field of filterKeys) {
    const path = field.split('$');
    const fieldName = path[path.length - 1];

    const values = extract(data, path);
    valuesMap.set(fieldName, [...new Set(values)]);
  }
  const response = {
    list: [...valuesMap],
  };
  return response;
};

const getTopProjects = function (data) {
  let topProjectsArray = [];
  try {
    if (data && data?.length > 0) {
      data.forEach((element) => {
        element.projects?.forEach((item) => {
          if (
            Number(item.priorityRanking) >= 1 &&
            Number(item.priorityRanking) <= 5
          ) {
            topProjectsArray.push({
              ...item,
              id: `${element?.id}-${item?.projectName}-${item?.status}`,
              name: element?.manager,
            });
          }
        });
      });
    }
  } catch (error) {
    throw new Error(error);
  }
  return topProjectsArray;
};

// EmployeeFormSchema Transformer

const transformSchema = function () {};

module.exports = {
  getList,
  fetchFiltersList,
};
