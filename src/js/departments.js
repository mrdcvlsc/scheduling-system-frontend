import { DEV, API_VERSION, base_url } from "./basics.js";

export async function fetchAllDepartments() {
  let api_request = `/${API_VERSION}/all_departments`

  if (DEV) {
    console.log('call: fetchAllDepartments')
    api_request = `${base_url}/${API_VERSION}/all_departments`
  }

  const response = await fetch(api_request, {
    headers: {
      Accept: "application/json",
    },
    method: 'GET'
  });

  if (!response.ok) {
    throw Error(`${response.status} :${await response.text()}`);
  }

  return response.json();
}

export async function fetchDepartmentCurriculumsData(department_id, semester) {
  let api_request = `/${API_VERSION}/department_data?department_id=${department_id}&semester=${semester}`

  if (DEV) {
    console.log('call: fetchDepartmentData')
    api_request = `${base_url}/${API_VERSION}/department_data?department_id=${department_id}&semester=${semester}`
  }

  const response = await fetch(api_request, {
    headers: {
      Accept: "application/json",
    },
    method: 'GET'
  });

  if (!response.ok) {
    throw Error(`${response.status} : ${await response.text()}`);
  }

  return await response.json();
}