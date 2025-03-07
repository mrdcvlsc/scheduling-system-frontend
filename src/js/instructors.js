import { DEV, API_VERSION, base_url } from "./basics.js";

export async function deleteRemoveInsturctor(instructor_id) {
  let api_request = `/${API_VERSION}/instructor_remove?instructor_id=${instructor_id}`

  if (DEV) {
    console.log('call: postUpdateInsturctor')
    api_request = `${base_url}/${API_VERSION}/instructor_remove?instructor_id=${instructor_id}`
  }

  const response = await fetch(api_request, {
    method: 'DELETE',
    headers: {
      Accept: "text/plain",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} : ${await response.text()}`);
  }
}

export async function postCreateInsturctor(instructor) {
  let api_request = `/${API_VERSION}/instructor_add`

  if (DEV) {
    console.log('call: postUpdateInsturctor')
    api_request = `${base_url}/${API_VERSION}/instructor_add`
  }

  const response = await fetch(api_request, {
    method: 'POST',
    headers: {
      Accept: "text/plain",
      "Content-Type": "application/json",
    },

    body: JSON.stringify(instructor)
  });

  if (!response.ok) {
    throw new Error(`${response.status} : ${await response.text()}`);
  }
}

export async function patchUpdateInsturctor(instructor) {
  let api_request = `/${API_VERSION}/instructor_update`

  if (DEV) {
    console.log('call: postUpdateInsturctor')
    api_request = `${base_url}/${API_VERSION}/instructor_update`
  }

  const response = await fetch(api_request, {
    method: 'PATCH',
    headers: {
      Accept: "text/plain",
      "Content-Type": "application/json",
    },

    body: JSON.stringify(instructor)
  });

  if (!response.ok) {
    throw new Error(`${response.status} : ${await response.text()}`);
  }
}

export async function fetchDepartmentInstructorsDefaults(department_id, semester, page_size, page) {
  let api_request = `/${API_VERSION}/instructors/d?department_id=${department_id}&semester=${semester}&page_size=${page_size}&page=${page}`

  if (DEV) {
    console.log('call: fetchDepartmentInstructorsDefaults')
    api_request = `${base_url}/${API_VERSION}/instructors/d?department_id=${department_id}&semester=${semester}&page_size=${page_size}&page=${page}`
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

export async function fetchDepartmentInstructorsAllocated(department_id, semester, page_size, page) {
  let api_request = `/${API_VERSION}/instructors/a?department_id=${department_id}&semester=${semester}&page_size=${page_size}&page=${page}`

  if (DEV) {
    console.log('call: fetchDepartmentInstructorsAllocated')
    api_request = `${base_url}/${API_VERSION}/instructors/a?department_id=${department_id}&semester=${semester}&page_size=${page_size}&page=${page}`
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