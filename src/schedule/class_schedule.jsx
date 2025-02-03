import { StrictMode, useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import "../assets/main.css";
import "./TimeTable.css";
import "./TimeTableDropdowns.css";

const formatTime = (hour, minutes) => {
  const period = hour >= 12 ? "PM" : "AM";
  const unformatted_hour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedHour = String(unformatted_hour).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  return `${formattedHour}:${formattedMinutes} ${period}`;
};

function generateTimeSlotRowLabels(startHour, minuteIntervals, dailyTimeSlots) {
  const time_slots = [];
  let hour = startHour;
  let minutes = 0;

  for (let i = 0; i < dailyTimeSlots; i++) {
    const startTime = formatTime(hour, minutes);

    let endHour = hour;
    let endMinutes = minutes + minuteIntervals;

    if (endMinutes >= 60) {
      endHour += Math.floor(endMinutes / 60);
      endMinutes %= 60;
    }

    const endTime = formatTime(endHour, endMinutes);

    time_slots.push({ time_range: `${startTime} - ${endTime}`, occupied: {} });

    minutes += minuteIntervals;
    if (minutes >= 60) {
      hour++;
      minutes %= 60;
    }
  }

  return time_slots;
};

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function TimeTable() {

  // variables and states needed to know the structure of the time table grid

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [startHour, setStartHour] = useState(7)
  const [timeSlotMinuteInterval, setTimeSlotMinuteInterval] = useState(30)
  const [dailyTimeSlots, setDailyTimeSlots] = useState(24)

  // states needed during initialization of page to load necessary drop down options and values

  const [curriculumData, setCurriculumData] = useState([]);
  const departmentID = useRef(0)

  // states needed to know which schedule to fetch from the backend

  const [curriculumIdx, setCurriculumIdx] = useState("");
  const [yearLevelIdx, setYearLevelIdx] = useState("");
  const [semesterIndex, setSemesterIndex] = useState("")
  const [selectedSectionScheduleIndex, setSelectedSectionScheduleIndex] = useState("");

  // states needed to display the selected class schedule

  const [classAssignedSubjects, setClassAssignedSubjects] = useState([])

  /////////////////////////////////////////////////////

  useEffect(() => {

    // TODO: fetch basic const values (data below is just temporary)

    console.log('department :', departmentID.current)

    const starting_hour = 7;
    const time_slot_per_hour = 2;
    const daily_time_slots = 24;

    const time_slot_minute_interval = 60 / time_slot_per_hour;

    setStartHour(starting_hour)
    setTimeSlotMinuteInterval(time_slot_minute_interval)
    setDailyTimeSlots(daily_time_slots)

    // TODO: get what department id is the current logged in user.

    departmentID.current = 1

    // TODO: fetch the curriculums micro data at the backend for the department (data below is just temporary)

    const curriculum_data = [
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

    setCurriculumData(curriculum_data)
  }, []);

  const fetchClassSchedule = async () => {

    // TODO: fetch subject schedules from the backend (data below is just temporary)

    const class_scheduled_subjects = [
      { "SubjectCode": "0000001", "DayIdx": 0, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
      { "SubjectCode": "0000002", "DayIdx": 0, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
      { "SubjectCode": "0000003", "DayIdx": 0, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0000004", "DayIdx": 0, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0000005", "DayIdx": 0, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0000006", "DayIdx": 0, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },

      { "SubjectCode": "0000011", "DayIdx": 1, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
      { "SubjectCode": "0000012", "DayIdx": 1, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
      { "SubjectCode": "0000013", "DayIdx": 1, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0000014", "DayIdx": 1, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0000015", "DayIdx": 1, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0000016", "DayIdx": 1, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },

      { "SubjectCode": "0000021", "DayIdx": 2, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
      { "SubjectCode": "0000022", "DayIdx": 2, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
      { "SubjectCode": "0000023", "DayIdx": 2, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0000024", "DayIdx": 2, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0000025", "DayIdx": 2, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0000026", "DayIdx": 2, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },

      { "SubjectCode": "0000031", "DayIdx": 3, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
      { "SubjectCode": "0000032", "DayIdx": 3, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
      { "SubjectCode": "0000033", "DayIdx": 3, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0000034", "DayIdx": 3, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0000035", "DayIdx": 3, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0000036", "DayIdx": 3, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },

      { "SubjectCode": "0000041", "DayIdx": 4, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
      { "SubjectCode": "0000042", "DayIdx": 4, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
      { "SubjectCode": "0000043", "DayIdx": 4, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "0000044", "DayIdx": 4, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
      { "SubjectCode": "0000045", "DayIdx": 4, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
      { "SubjectCode": "1111146", "DayIdx": 4, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
    ];
    setClassAssignedSubjects(class_scheduled_subjects);

    const subject_colors = []

    class_scheduled_subjects.forEach((subject, index) => {
      subject_colors[subject.SubjectCode] = `color-${index + 1}`;
    });

    setSubjectColors(subject_colors)
  };

  const handleCurriculumChange = (event) => {
    const curriculum_idx = event.target.value;
    console.log('curriculum_idx = ', curriculum_idx)
    setCurriculumIdx(curriculum_idx);
    setYearLevelIdx("")
    setSelectedSectionScheduleIndex("")
    setSemesterIndex("")
    setClassAssignedSubjects([])
  };

  const handleYearLevelChange = (event) => {
    const year_level_idx = event.target.value;
    console.log('year_level_idx = ', year_level_idx)
    setYearLevelIdx(year_level_idx);
    setSelectedSectionScheduleIndex("")
    setSemesterIndex("")
    setClassAssignedSubjects([])
  };

  const handleSectionChange = (event) => {
    setSelectedSectionScheduleIndex(event.target.value);
    setClassAssignedSubjects([])
    console.log('section selected schedule index value:', event.target.value)
  };

  const handleFetch = async () => {
    console.log("Fetch data for:", departmentID.current, semesterIndex, selectedSectionScheduleIndex);
    await fetchClassSchedule();
  };

  const [subjectColors, setSubjectColors] = useState({});

  return (
    <div className="table-container">

      {/*================================= Dropdown Container =================================*/}

      <div className="dropdown-container">
        <div id="right-dropdown-container">
          <select className="dropdown" value={curriculumIdx} onChange={handleCurriculumChange}>
            <option value="">Select Course</option>
            {curriculumData ?
              curriculumData.map((curriculum, idx) => (
                <option key={curriculum.CurriculumCode} value={idx}>
                  {curriculum.CurriculumName}
                </option>
              ))
              :
              null
            }
          </select>

          <select className="dropdown" value={yearLevelIdx} onChange={handleYearLevelChange} disabled={!curriculumIdx}>
            <option value="">Select Year Level</option>
            {curriculumIdx ?
              curriculumData[curriculumIdx].YearLevels.map((year_level, index) => (
                <option key={index} value={index}>
                  {year_level.Name}
                </option>
              ))
              :
              null
            }
          </select>

          <select className="dropdown" value={selectedSectionScheduleIndex} onChange={handleSectionChange} disabled={!yearLevelIdx}>
            <option value="">Select Section</option>
            {yearLevelIdx ?
              curriculumData[curriculumIdx].YearLevels[yearLevelIdx].Sections.map((section_schedule_index, index) => (
                <option key={index} value={section_schedule_index}>
                  {`Section ${alphabet[index]}`}
                </option>
              ))
              :
              null
            }
          </select>
        </div>
        <button className="fetch-button" onClick={handleFetch} disabled={!selectedSectionScheduleIndex}>
          fetch schedule
        </button>
      </div>

      {/*================================= TimeTable Table =================================*/}

      <table className="time-table">
        <thead>
          <tr>
            <th className="time-slot-header">Time Slot</th>
            {days.map((day) => (
              <th key={day} className="day-header">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {generateTimeSlotRowLabels(startHour, timeSlotMinuteInterval, dailyTimeSlots).map((time_slot_label, row_idx) => (
            <tr key={row_idx}>
              <td className="time-slot">{time_slot_label.time_range}</td>
              {days.map((_, day_idx) => {
                const has_assigned_subject = classAssignedSubjects.find(
                  (subj) => subj.DayIdx === day_idx && subj.TimeSlotIdx === row_idx
                );

                if (has_assigned_subject) {
                  return (
                    <td key={day_idx} className={`subject-cell ${subjectColors[has_assigned_subject.SubjectCode]}`} rowSpan={has_assigned_subject.SubjectTimeSlots}>
                      <div className="subject-content">
                        <div className="subject-name">{has_assigned_subject.SubjectCode}</div>
                        <div className="instructor">{has_assigned_subject.InstructorLastName}</div>
                        <div className="room">{has_assigned_subject.RoomName}</div>
                      </div>
                    </td>
                  );
                }

                // row spans occupy space in a tr despite not having the td element spanning in that tr,
                // that's why this logic is needed because if we didn't do this, we will add empty slots
                // to the rows with cells that are affected by a row spans, which could lead to new empty
                // slots that can go outside of the table.

                const is_occupied = classAssignedSubjects.some((subject) => {
                  const has_hit_subject_in_row = row_idx >= subject.TimeSlotIdx && row_idx < (subject.TimeSlotIdx + subject.SubjectTimeSlots);
                  const has_hit_subject_in_col = day_idx == subject.DayIdx;
                  return has_hit_subject_in_row && has_hit_subject_in_col;
                })

                return is_occupied ? null : <td key={day_idx} className="empty-slot"></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TimeTable />
  </StrictMode>
);
