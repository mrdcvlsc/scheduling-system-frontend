import { StrictMode, useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import { Loading, Popup } from "../components/Loading";

import "../assets/main.css";
import "./TimeTable.css";
import "./TimeTableDropdowns.css";

import { fetch_class_json_schedule, fetch_department_data } from "../fetch/schedule"

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

    time_slots.push(`${startTime} - ${endTime}`);

    minutes += minuteIntervals;
    if (minutes >= 60) {
      hour++;
      minutes %= 60;
    }
  }

  return time_slots;
};

const SECTION_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz";

function TimeTable() {

  ////////////////////// Loading State Properties //////////////////////

  const [IsLoading, setIsLoading] = useState(false);
  const [popupOptions, setPopupOptions] = useState(null)

  // variables and states needed to know the structure of the time table grid

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [startHour, setStartHour] = useState(7)
  const [timeSlotMinuteInterval, setTimeSlotMinuteInterval] = useState(30)
  const [dailyTimeSlots, setDailyTimeSlots] = useState(24)

  // states needed during initialization of page to load necessary drop down options and values

  const [curriculumData, setCurriculumData] = useState([]);
  const departmentID = useRef(0)

  // states needed to know which schedule to fetch from the backend

  const [semesterIndex, setSemesterIndex] = useState("")
  const [curriculumIndex, setCurriculumIndex] = useState("");
  const [yearLevelIndex, setYearLevelIndex] = useState("");
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
  }, []);

  const handleSemesterChange = async (event) => {
    const semester_idx = event.target.value;
    console.log('semester_idx = ', semester_idx)
    setSemesterIndex(semester_idx)
    setCurriculumIndex("")
    setYearLevelIndex("")
    setSelectedSectionScheduleIndex("")
    setClassAssignedSubjects([])

    if (event.target.value) {
      setIsLoading(true);
      console.log("fetch semestral data for :", departmentID.current, event.target.value);

      try {
        const curriculum_data = await fetch_department_data(departmentID.current, event.target.value)

        // const curriculum_data = [
        //   {
        //     "CurriculumName": "Bachelor of Science in Computer Science",
        //     "CurriculumID": 3, "CurriculumCode": "BSCS", "YearLevels": [
        //       { "Name": "1st Year", "Sections": [32, 33, 34, 35] },
        //       { "Name": "2nd Year", "Sections": [36, 37] },
        //       { "Name": "3rd Year", "Sections": [40, 41, 42] },
        //       { "Name": "4th Year", "Sections": [44, 45, 46, 47] }
        //     ]
        //   },
        //   {
        //     "CurriculumName": "Bachelor of Science in Information Technology",
        //     "CurriculumID": 4, "CurriculumCode": "BSIT", "YearLevels": [
        //       { "Name": "1st Year", "Sections": [48] },
        //       { "Name": "2nd Year", "Sections": [52, 53, 54, 55] },
        //     ]
        //   }
        // ]

        setCurriculumData(curriculum_data)

        setIsLoading(false);
      } catch (err) {
        setPopupOptions({
          Heading: "Failed to Fetch Semester Data",
          HeadingStyle: { background: "red", color: "white" },
          Message: `${err}`
        })
        setIsLoading(false);
        setSemesterIndex("")
      }
    }
  };

  const handleCurriculumChange = (event) => {
    const curriculum_idx = event.target.value;
    console.log('curriculum_idx = ', curriculum_idx)
    setCurriculumIndex(curriculum_idx)
    setYearLevelIndex("")
    setSelectedSectionScheduleIndex("")
    setClassAssignedSubjects([])
  };

  const handleYearLevelChange = (event) => {
    const year_level_idx = event.target.value;
    console.log('year_level_idx = ', year_level_idx)
    setYearLevelIndex(year_level_idx)
    setSelectedSectionScheduleIndex("")
    setClassAssignedSubjects([])
  };

  const handleSectionChange = async (event) => {
    setSelectedSectionScheduleIndex(event.target.value);
    setClassAssignedSubjects([])
    console.log('section selected schedule index value:', event.target.value)

    if (event.target.value) {
      setIsLoading(true);
      console.log("Fetch data for:", departmentID.current, semesterIndex, event.target.value);

      try {
        const class_scheduled_subjects = await fetch_class_json_schedule(departmentID.current, semesterIndex, event.target.value)

        // const class_scheduled_subjects = [
        //   { "SubjectCode": "0001", "DayIdx": 0, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
        //   { "SubjectCode": "0002", "DayIdx": 0, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
        //   { "SubjectCode": "0003", "DayIdx": 0, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
        //   { "SubjectCode": "0004", "DayIdx": 0, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
        //   { "SubjectCode": "0005", "DayIdx": 0, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
        //   { "SubjectCode": "0006", "DayIdx": 0, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },

        //   { "SubjectCode": "0011", "DayIdx": 1, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
        //   { "SubjectCode": "0012", "DayIdx": 1, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
        //   { "SubjectCode": "0013", "DayIdx": 1, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
        //   { "SubjectCode": "0014", "DayIdx": 1, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
        //   { "SubjectCode": "0015", "DayIdx": 1, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
        //   { "SubjectCode": "0016", "DayIdx": 1, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },

        //   { "SubjectCode": "0021", "DayIdx": 2, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
        //   { "SubjectCode": "0022", "DayIdx": 2, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
        //   { "SubjectCode": "0023", "DayIdx": 2, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
        //   { "SubjectCode": "0024", "DayIdx": 2, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
        //   { "SubjectCode": "0025", "DayIdx": 2, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
        //   { "SubjectCode": "0026", "DayIdx": 2, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },

        //   { "SubjectCode": "0031", "DayIdx": 3, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
        //   { "SubjectCode": "0032", "DayIdx": 3, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
        //   { "SubjectCode": "0033", "DayIdx": 3, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
        //   { "SubjectCode": "0034", "DayIdx": 3, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
        //   { "SubjectCode": "0035", "DayIdx": 3, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
        //   { "SubjectCode": "0036", "DayIdx": 3, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },

        //   { "SubjectCode": "0041", "DayIdx": 4, "TimeSlotIdx": 0, "SubjectTimeSlots": 3, "InstructorLastName": "John", "RoomName": "RM 4" },
        //   { "SubjectCode": "0042", "DayIdx": 4, "TimeSlotIdx": 4, "SubjectTimeSlots": 3, "InstructorLastName": "Jane", "RoomName": "RM 4" },
        //   { "SubjectCode": "0043", "DayIdx": 4, "TimeSlotIdx": 8, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
        //   { "SubjectCode": "0044", "DayIdx": 4, "TimeSlotIdx": 12, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
        //   { "SubjectCode": "0045", "DayIdx": 4, "TimeSlotIdx": 16, "SubjectTimeSlots": 3, "InstructorLastName": "Alice", "RoomName": "RM 47" },
        //   { "SubjectCode": "1146", "DayIdx": 4, "TimeSlotIdx": 20, "SubjectTimeSlots": 3, "InstructorLastName": "Bob", "RoomName": "RM 47" },
        // ];

        setClassAssignedSubjects(class_scheduled_subjects);

        const subject_colors = []
        let subject_count = 0

        class_scheduled_subjects.forEach((subject) => {
          if (!subject_colors[subject.SubjectCode]) {
            subject_count++
            subject_colors[subject.SubjectCode] = `color-${subject_count}`;
          }
        });

        setSubjectColors(subject_colors)

        setIsLoading(false);
      } catch (err) {
        setPopupOptions({
          Heading: "Failed To Retrieve Schedule",
          HeadingStyle: { background: "red", color: "white" },
          Message: `${err}`
        })
        setIsLoading(false);
      }
    }
  };

  const handleFetch = async () => {
    console.log("Fetch data for:", departmentID.current, semesterIndex, selectedSectionScheduleIndex);

  };

  const [subjectColors, setSubjectColors] = useState({});

  return (
    <>
      {/*================================= Loading Component =================================*/}

      <Popup popupOptions={popupOptions} closeButtonActionHandler={() => {
        setPopupOptions(null);
      }} />

      <Loading
        IsLoading={IsLoading}
      />

      <div className="table-container">

        {/*================================= Dropdown Container =================================*/}

        <div className="dropdown-container">
          <div id="left-dropdown-container">
            <select className="dropdown" value={semesterIndex} onChange={handleSemesterChange}>
              <option value="">Semester</option>
              <option value="0">1st Semester</option>
              <option value="1">2nd Semester</option>
            </select>

            <select className="dropdown" value={curriculumIndex} onChange={handleCurriculumChange} disabled={!semesterIndex}>
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

            <select className="dropdown" value={yearLevelIndex} onChange={handleYearLevelChange} disabled={!curriculumIndex}>
              <option value="">Year Level</option>
              {curriculumIndex ?
                curriculumData[curriculumIndex].YearLevels.map((year_level, index) => (
                  <option key={index} value={index}>
                    {year_level.Name}
                  </option>
                ))
                :
                null
              }
            </select>

            <select className="dropdown" value={selectedSectionScheduleIndex} onChange={handleSectionChange} disabled={!yearLevelIndex}>
              <option value="">Section</option>
              {yearLevelIndex ?
                curriculumData[curriculumIndex].YearLevels[yearLevelIndex].Sections.map((section_schedule_index, index) => (
                  <option key={index} value={section_schedule_index}>
                    {`Section ${SECTION_CHARACTERS[index]}`}
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
                <td className="time-slot">{time_slot_label}</td>
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
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TimeTable />
  </StrictMode>
);
