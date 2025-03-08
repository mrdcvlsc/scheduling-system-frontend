import { DEV, API_VERSION, base_url } from "./basics.js";

export async function fetchSubjects(page_size, page) {
  let api_request = `/${API_VERSION}/subjects?page_size=${page_size}&page=${page}`

  if (DEV) {
    console.log('call: fetchSubjectsDefaults')
    api_request = `${base_url}/${API_VERSION}/subjects?page_size=${page_size}&page=${page}`
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

export async function deleteRemoveSubject(subject_id) {
  let api_request = `/${API_VERSION}/subject_remove?subject_id=${subject_id}`

  if (DEV) {
    console.log('call: postUpdateSubject')
    api_request = `${base_url}/${API_VERSION}/subject_remove?subject_id=${subject_id}`
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

export async function postCreateSubject(subject) {
  let api_request = `/${API_VERSION}/subject_add`

  if (DEV) {
    console.log('call: postUpdateSubject')
    api_request = `${base_url}/${API_VERSION}/subject_add`
  }

  const response = await fetch(api_request, {
    method: 'POST',
    headers: {
      Accept: "text/plain",
      "Content-Type": "application/json",
    },

    body: JSON.stringify(subject)
  });

  if (!response.ok) {
    throw new Error(`${response.status} : ${await response.text()}`);
  }
}

export async function patchUpdateSubject(subject) {
  let api_request = `/${API_VERSION}/subject_update`

  if (DEV) {
    console.log('call: postUpdateSubject')
    api_request = `${base_url}/${API_VERSION}/subject_update`
  }

  const response = await fetch(api_request, {
    method: 'PATCH',
    headers: {
      Accept: "text/plain",
      "Content-Type": "application/json",
    },

    body: JSON.stringify(subject)
  });

  if (!response.ok) {
    throw new Error(`${response.status} : ${await response.text()}`);
  }
}