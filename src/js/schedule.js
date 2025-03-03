const API_VERSION = 'v1'
const DEV = true

// this is for development only.
const base_url = 'http://localhost:3000'

export async function postUpdateInsturctor(instructor) {
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

export async function fetchConst() {
  let api_request = `/${API_VERSION}/const`

  if (DEV) {
    console.log('call: fetchConst')
    api_request = `${base_url}/${API_VERSION}/const`
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

export async function fetchDepartmentData(department_id, semester) {
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

export async function fetchSerializedUniversitySchedule(selected_semester) {
  let api_request = `/${API_VERSION}/university_schedule?semester=${selected_semester}`

  if (DEV) {
    console.log('call: fetchSerializedUniversitySchedule')
    api_request = `${base_url}/${API_VERSION}/university_schedule?semester=${selected_semester}`
  }

  const response = await fetch(api_request, {
    headers: {
      Accept: "text/plain",
    },
    method: 'GET'
  });

  if (!response.ok) {
    throw Error(`${response.status} : ${await response.text()}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

export async function fetchSerializedClassSchedule(department_id, selected_semester, schedule_idx) {
  let api_request = `/${API_VERSION}/class_schedule?department_id=${department_id}&semester=${selected_semester}&schedule_idx=${schedule_idx}`

  if (DEV) {
    console.log('call: fetchSerializedClassSchedule')
    api_request = `${base_url}/${API_VERSION}/class_schedule?department_id=${department_id}&semester=${selected_semester}&schedule_idx=${schedule_idx}`
  }

  const response = await fetch(api_request, {
    headers: {
      Accept: "text/plain",
    },
    method: 'GET'
  });

  if (!response.ok) {
    throw Error(`${response.status} : ${await response.text()}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

export async function fetchClassJsonSchedule(department_id, selected_semester, schedule_idx) {
  let api_request = `/${API_VERSION}/class_json_schedule?department_id=${department_id}&semester=${selected_semester}&schedule_idx=${schedule_idx}`

  if (DEV) {
    console.log('call: fetchClassJsonSchedule')
    api_request = `${base_url}/${API_VERSION}/class_json_schedule?department_id=${department_id}&semester=${selected_semester}&schedule_idx=${schedule_idx}`
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

export async function sendSerializedSchedule(selected_semester, serialized_schedule) {
  let api_request = `/${API_VERSION}/university_schedule?semester=${selected_semester}`

  if (DEV) {
    console.log('call: sendSerializedSchedule')
    api_request = `${base_url}/${API_VERSION}/university_schedule?semester=${selected_semester}`
  }

  const response = await fetch(api_request, {
    method: 'POST',
    headers: {
      Accept: "text/plain",
      'Content-Type': 'application/octet-stream'
    },
    body: serialized_schedule
  });

  if (!response.ok) {
    throw new Error(`${response.status} : ${await response.text()}`);
  }
}

export async function deserializeSchedule(serialized_data) {
  let constants = await fetchConst()

  const time_slot_bytes = constants.time_slot_bytes;
  const weekly_school_days = constants.weekly_school_days;

  const daily_time_slots = constants.daily_time_slots;
  const weekly_time_slots = constants.weekly_time_slots;

  const university_schedules = [];
  const number_of_sections = serialized_data.length / (weekly_time_slots * time_slot_bytes);

  let offset = 0;

  for (let section_idx = 0; section_idx < number_of_sections; section_idx++) {
    const week_time_table = [];
    for (let day = 0; day < weekly_school_days; day++) {
      const day_time_table = [];
      for (let time_slot = 0; time_slot < daily_time_slots; time_slot++) {
        const subjectID = (serialized_data[offset] | (serialized_data[offset + 1] << 8));
        const instructorID = (serialized_data[offset + 2] | (serialized_data[offset + 3] << 8));
        const roomID = (serialized_data[offset + 4] | (serialized_data[offset + 5] << 8));

        day_time_table.push({ subjectID, instructorID, roomID });
        offset += time_slot_bytes;
      }
      week_time_table.push(day_time_table);
    }
    university_schedules.push(week_time_table);
  }

  return university_schedules;
}

export async function serializeSchedule(university_schedules) {
  let constants = await fetchConst()

  const time_slot_bytes = constants.time_slot_bytes;
  const weekly_time_slots = constants.weekly_time_slots;

  const serialized_data = new Uint8Array(university_schedules.length * weekly_time_slots * time_slot_bytes);

  let offset = 0;

  for (const section_week_schedule of university_schedules) {
    for (const day of section_week_schedule) {
      for (const time_slot of day) {
        serialized_data[offset] = time_slot.subjectID & 0xff;
        serialized_data[offset + 1] = (time_slot.subjectID >> 8) & 0xff;
        serialized_data[offset + 2] = time_slot.instructorID & 0xff;
        serialized_data[offset + 3] = (time_slot.instructorID >> 8) & 0xff;
        serialized_data[offset + 4] = time_slot.roomID & 0xff;
        serialized_data[offset + 5] = (time_slot.roomID >> 8) & 0xff;

        offset += time_slot_bytes;
      }
    }
  }

  return serialized_data;
}

export async function generateSchedule(selected_semester) {
  let api_request = `/${API_VERSION}/generate_schedule?semester=${selected_semester}`

  if (DEV) {
    console.log('call: generateSchedule')
    api_request = `${base_url}/${API_VERSION}/generate_schedule?semester=${selected_semester}`
  }

  const response = await fetch(api_request, {
    method: 'POST',
    headers: {
      Accept: "text/plain",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} : ${await response.text()}`);
  }
}