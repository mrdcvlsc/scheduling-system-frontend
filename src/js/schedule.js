const API_VERSION = 'v1'
const DEV = true

async function fetch_department_instructors_erd(department_id, semester, base_url = '') {
  if (DEV) {
    return [
      { "InstructorID": 3, "DepartmentID": 1, "FirstName": "Alice", "MiddleInitial": "M",
        "LastName": "Garcia", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["31", "0", "0"]
      },
      { "InstructorID": 4, "DepartmentID": 1, "FirstName": "Bob", "MiddleInitial": "A",
        "LastName": "Smith", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 5, "DepartmentID": 0, "FirstName": "Catherine", "MiddleInitial": "D",
        "LastName": "Johnson", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 6, "DepartmentID": 1, "FirstName": "David", "MiddleInitial": "R",
        "LastName": "Brown", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 7, "DepartmentID": 1, "FirstName": "Ella", "MiddleInitial": "F",
        "LastName": "Jones", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 8, "DepartmentID": 1, "FirstName": "Frank", "MiddleInitial": "P",
        "LastName": "Miller", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 9, "DepartmentID": 1, "FirstName": "Grace", "MiddleInitial": "L",
        "LastName": "Davis", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 10, "DepartmentID": 1, "FirstName": "Henry", "MiddleInitial": "T",
        "LastName": "Wilson", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 11, "DepartmentID": 0, "FirstName": "Isabel", "MiddleInitial": "K",
        "LastName": "Moore", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 12, "DepartmentID": 1, "FirstName": "Jack", "MiddleInitial": "G",
        "LastName": "Taylor", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 13, "DepartmentID": 1, "FirstName": "Katherine", "MiddleInitial": "Z",
        "LastName": "Anderson", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 14, "DepartmentID": 1, "FirstName": "Liam", "MiddleInitial": "Q",
        "LastName": "Thomas", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 15, "DepartmentID": 1, "FirstName": "Mia", "MiddleInitial": "J",
        "LastName": "Martin", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 16, "DepartmentID": 1, "FirstName": "Roboute", "MiddleInitial": "E",
        "LastName": "Guilliman", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      }
    ]
  }

  const response = await fetch(`${base_url}/${API_VERSION}/instructor_erd?department_id=${department_id}&semester=${semester}`, {
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

async function fetch_department_instructors_era(department_id, semester, base_url = '') {
  if (DEV) {
    return [
      { "InstructorID": 3, "DepartmentID": 1, "FirstName": "Alice", "MiddleInitial": "M",
        "LastName": "Garcia", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "332"]
      },
      { "InstructorID": 4, "DepartmentID": 1, "FirstName": "Bob", "MiddleInitial": "A",
        "LastName": "Smith", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["22", "1154", "3243"]
      },
      { "InstructorID": 5, "DepartmentID": 0, "FirstName": "Catherine", "MiddleInitial": "D",
        "LastName": "Johnson", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 6, "DepartmentID": 1, "FirstName": "David", "MiddleInitial": "R",
        "LastName": "Brown", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 7, "DepartmentID": 1, "FirstName": "Ella", "MiddleInitial": "F",
        "LastName": "Jones", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 8, "DepartmentID": 1, "FirstName": "Frank", "MiddleInitial": "P",
        "LastName": "Miller", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 9, "DepartmentID": 1, "FirstName": "Grace", "MiddleInitial": "L",
        "LastName": "Davis", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 10, "DepartmentID": 1, "FirstName": "Henry", "MiddleInitial": "T",
        "LastName": "Wilson", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 11, "DepartmentID": 0, "FirstName": "Isabel", "MiddleInitial": "K",
        "LastName": "Moore", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 12, "DepartmentID": 1, "FirstName": "Jack", "MiddleInitial": "G",
        "LastName": "Taylor", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 13, "DepartmentID": 1, "FirstName": "Katherine", "MiddleInitial": "Z",
        "LastName": "Anderson", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 14, "DepartmentID": 1, "FirstName": "Liam", "MiddleInitial": "Q",
        "LastName": "Thomas", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 15, "DepartmentID": 1, "FirstName": "Mia", "MiddleInitial": "J",
        "LastName": "Martin", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      },
      { "InstructorID": 16, "DepartmentID": 1, "FirstName": "Roboute", "MiddleInitial": "E",
        "LastName": "Guilliman", "AssignedSubjects": 0, "TotalTeachingHours": 0,
        "Time": ["0", "0", "0"]
      }
    ]
  }

  const response = await fetch(`${base_url}/${API_VERSION}/instructor_era?department_id=${department_id}&semester=${semester}`, {
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

async function fetch_all_departments(base_url = '') {
  if (DEV) {
    return [
      { "DepartmentID": 1, "Code": "DIT", "Name": "Department of Information Technology" },
      { "DepartmentID": 2, "Code": "DAS", "Name": "Department of Arts and Sciences" },
      { "DepartmentID": 3, "Code": "DOM", "Name": "Department of Management" },
      { "DepartmentID": 4, "Code": "TED", "Name": "Teacher Education Department" }
    ]
  }

  const response = await fetch(`${base_url}/${API_VERSION}/all_departments`, {
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

async function fetch_const(base_url = '') {
  const response = await fetch(`${base_url}/${API_VERSION}/const`, {
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

async function fetch_department_data(department_id, semester, base_url = '') {
  if (DEV) {
    return [
      {
        "CurriculumName": "Bachelor of Science in Computer Science",
        "CurriculumID": 3, "CurriculumCode": "BSCS", "YearLevels": [
          { "Name": "1st Year", "Sections": [32, 33, 34, 35] },
          { "Name": "2nd Year", "Sections": [36, 37] },
          { "Name": "3rd Year", "Sections": [40, 41, 42] },
          { "Name": "4th Year", "Sections": [44, 45, 46, 47] }
        ]
      },
      {
        "CurriculumName": "Bachelor of Science in Information Technology",
        "CurriculumID": 4, "CurriculumCode": "BSIT", "YearLevels": [
          { "Name": "1st Year", "Sections": [48] },
          { "Name": "2nd Year", "Sections": [52, 53, 54, 55] },
        ]
      }
    ]
  }

  const response = await fetch(
    `${base_url}/${API_VERSION}/department_data?department_id=${department_id}&semester=${semester}`, {
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

async function fetch_serialized_university_schedule(selected_semester, base_url = '') {
  const response = await fetch(`${base_url}/${API_VERSION}/university_schedule?semester=${selected_semester}`, {
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

async function fetch_serialized_class_schedule(department_id, selected_semester, schedule_idx, base_url = '') {
  const response = await fetch(
    `${base_url}/${API_VERSION}/class_schedule?department_id=${department_id}&semester=${selected_semester}&schedule_idx=${schedule_idx}`, {
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

async function fetch_class_json_schedule(department_id, selected_semester, schedule_idx, base_url = '') {
  if (DEV) {
    return [
      { "SubjectCode": "0001", "DayIdx": 0, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
      { "SubjectCode": "0002", "DayIdx": 0, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
      { "SubjectCode": "0003", "DayIdx": 0, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0004", "DayIdx": 0, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0005", "DayIdx": 0, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0006", "DayIdx": 0, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },

      { "SubjectCode": "0011", "DayIdx": 1, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
      { "SubjectCode": "0012", "DayIdx": 1, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
      { "SubjectCode": "0013", "DayIdx": 1, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0014", "DayIdx": 1, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0015", "DayIdx": 1, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0016", "DayIdx": 1, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },

      { "SubjectCode": "0021", "DayIdx": 2, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
      { "SubjectCode": "0022", "DayIdx": 2, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
      { "SubjectCode": "0023", "DayIdx": 2, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0024", "DayIdx": 2, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0025", "DayIdx": 2, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0026", "DayIdx": 2, "TimeSlotIdx": 20, "SubjectTimeSlots": 4, "InstructorLastName": "Bob", "RoomName": "RM 47" },

      { "SubjectCode": "0031", "DayIdx": 3, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
      { "SubjectCode": "0032", "DayIdx": 3, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
      { "SubjectCode": "0033", "DayIdx": 3, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0034", "DayIdx": 3, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0035", "DayIdx": 3, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0036", "DayIdx": 3, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },

      { "SubjectCode": "0041", "DayIdx": 4, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
      { "SubjectCode": "0042", "DayIdx": 4, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
      { "SubjectCode": "0043", "DayIdx": 4, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0044", "DayIdx": 4, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0045", "DayIdx": 4, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "1146", "DayIdx": 4, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
    ];
  }

  const response = await fetch(
    `${base_url}/${API_VERSION}/class_json_schedule?department_id=${department_id}&semester=${selected_semester}&schedule_idx=${schedule_idx}`, {
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

async function send_serialized_schedule(selected_semester, serialized_schedule, base_url = '') {
  const response = await fetch(`${base_url}/${API_VERSION}/university_schedule?semester=${selected_semester}`, {
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

async function deserialize_schedule(serialized_data, base_url = '') {
  let constants = await fetch_const(base_url)

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

async function serialize_schedule(university_schedules, base_url = '') {
  let constants = await fetch_const(base_url)

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

async function generate_schedule(selected_semester, base_url = '') {
  const response = await fetch(`${base_url}/${API_VERSION}/generate_schedule?semester=${selected_semester}`, {
    method: 'POST',
    headers: {
      Accept: "text/plain",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} : ${await response.text()}`);
  }
}

export {
  fetch_const,
  fetch_all_departments,
  fetch_department_data,
  fetch_serialized_university_schedule,
  fetch_serialized_class_schedule,
  fetch_class_json_schedule,
  send_serialized_schedule,
  deserialize_schedule,
  serialize_schedule,
  generate_schedule,
  fetch_department_instructors_erd,
  fetch_department_instructors_era,
}