import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { Loading, Popup } from "../components/Loading";

import "../assets/main.css";
import "./TimeTable.css";
import "./TimeTableDropdowns.css";

import { fetchAllDepartments, fetchDepartmentData } from "../js/departments"
import { deserializeSchedule, fetchClassJsonSchedule, fetchSerializedClassSchedule } from "../js/schedule"

import { generateTimeSlotRowLabels } from "../js/week-time-table-grid-functions";

const SECTION_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz";

function TimeTable() {

  /////////////////////////////////////////////////////////////////////////////////
  //                     LOAD GUARD COMPONENT STATES
  /////////////////////////////////////////////////////////////////////////////////

  const [IsLoading, setIsLoading] = useState(false);
  const [popupOptions, setPopupOptions] = useState(null);

  /////////////////////////////////////////////////////////////////////////////////
  //                       TIME TABLE GRID STATES
  /////////////////////////////////////////////////////////////////////////////////

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [startHour, setStartHour] = useState(7);
  const [timeSlotMinuteInterval, setTimeSlotMinuteInterval] = useState(30);
  const [dailyTimeSlots, setDailyTimeSlots] = useState(24);

  /////////////////////////////////////////////////////////////////////////////////
  //                       STATES FOR FETCHED DATA
  /////////////////////////////////////////////////////////////////////////////////

  const [allDepartment, setAllDepartment] = useState([]);                // fetch on page load
  const [curriculumData, setCurriculumData] = useState([]);              // fetch on semester selection
  const [classAssignedSubjects, setClassAssignedSubjects] = useState([]) // fetch on section selection

  /////////////////////////////////////////////////////////////////////////////////
  //                       DROPDOWN SELECTION STATES
  /////////////////////////////////////////////////////////////////////////////////

  const [departmentID, setDepartmentID] = useState("");
  const [semesterIndex, setSemesterIndex] = useState("");
  const [curriculumIndex, setCurriculumIndex] = useState("");
  const [yearLevelIndex, setYearLevelIndex] = useState("");
  const [sectionSchedIndex, setSectionSchedIndex] = useState("");

  /////////////////////////////////////////////////////////////////////////////////
  //                       PAGE LOAD PROCESS
  /////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {

    // TODO: fetch basic const values (data below is just temporary);

    const starting_hour = 7;
    const time_slot_per_hour = 2;
    const daily_time_slots = 24;

    const time_slot_minute_interval = 60 / time_slot_per_hour;

    setStartHour(starting_hour);
    setTimeSlotMinuteInterval(time_slot_minute_interval);
    setDailyTimeSlots(daily_time_slots);

    useEffectAsyncs();
  }, []);

  async function useEffectAsyncs() {
    try {
      setIsLoading(true);

      const all_departments = await fetchAllDepartments();

      setAllDepartment(all_departments);
      console.log(all_departments);

      setIsLoading(false);
    } catch (err) {
      setPopupOptions({
        Heading: "Failed to Fetch All Department Data",
        HeadingStyle: { background: "red", color: "white" },
        Message: `${err}`
      });
      setIsLoading(false);
      setSemesterIndex("");
    }
  }

  /////////////////////////////////////////////////////////////////////////////////
  //                       DROPDOWN HANDLERS
  /////////////////////////////////////////////////////////////////////////////////

  const handleDepartmentChange = async (event) => {
    console.log(`selected departmentID: ${event.target.value}`);
    setDepartmentID(event.target.value);
    setSemesterIndex("");
    setCurriculumIndex("");
    setYearLevelIndex("");
    setSectionSchedIndex("");
    setClassAssignedSubjects([]);
  }

  const handleSemesterChange = async (event) => {
    console.log(`selected semesterIndex: ${event.target.value}`);
    setSemesterIndex(event.target.value);
    setCurriculumIndex("");
    setYearLevelIndex("");
    setSectionSchedIndex("");
    setClassAssignedSubjects([]);

    if (event.target.value) {
      setIsLoading(true);

      try {
        const curriculum_data = await fetchDepartmentData(departmentID, event.target.value);
        setCurriculumData(curriculum_data);

        setIsLoading(false);
      } catch (err) {
        setPopupOptions({
          Heading: "Failed to Fetch Semester Data",
          HeadingStyle: { background: "red", color: "white" },
          Message: `${err}`
        });
        setIsLoading(false);
        setSemesterIndex("");
      }
    }
  };

  const handleCurriculumChange = (event) => {
    console.log(`selected curriculumIndex: ${event.target.value}`);
    setCurriculumIndex(event.target.value);
    setYearLevelIndex("");
    setSectionSchedIndex("");
    setClassAssignedSubjects([]);
  };

  const handleYearLevelChange = (event) => {
    console.log(`selected yearLevelIndex: ${event.target.value}`);
    setYearLevelIndex(event.target.value);
    setSectionSchedIndex("");
    setClassAssignedSubjects([]);
  };

  const handleSectionChange = async (event) => {
    console.log(`selected sectionSchedIndex: ${event.target.value}`);

    console.log(
      `fetching : DepartmentID=${departmentID}, SemesterIndex=${semesterIndex}, ScheduleIndex=${event.target.value}`
    );

    setSectionSchedIndex(event.target.value);
    setClassAssignedSubjects([]);

    if (event.target.value) {
      setIsLoading(true);

      try {
        const class_scheduled_subjects = await fetchClassJsonSchedule(departmentID, semesterIndex, event.target.value);
        
        // DEBUG BLOCK: START
        const class_serialized_scheduled = await fetchSerializedClassSchedule(departmentID, semesterIndex, event.target.value);
        const class_deserialized_sched = await deserializeSchedule(class_serialized_scheduled);

        console.log('deserialized schedule :');
        console.log(class_deserialized_sched);
        console.log('json sched :');
        console.log(class_scheduled_subjects);
        // DEBUG BLOCK: END

        setClassAssignedSubjects(class_scheduled_subjects);

        const subject_colors = [];
        let subject_count = 0;

        class_scheduled_subjects.forEach((subject) => {
          if (!subject_colors[subject.SubjectCode]) {
            subject_count++;
            subject_colors[subject.SubjectCode] = `color-${subject_count}`;
          }
        });

        setSubjectColors(subject_colors);

        setIsLoading(false);
      } catch (err) {
        setPopupOptions({
          Heading: "Failed To Retrieve Schedule",
          HeadingStyle: { background: "red", color: "white" },
          Message: `${err}`
        });
        setIsLoading(false);
      }
    }
  };

  /////////////////////////////////////////////////////////////////////////////////
  //                             DROPDOWN HANDLERS
  /////////////////////////////////////////////////////////////////////////////////

  const handleFetch = async () => {
    console.log(
      `departmentID: ${departmentID}, semesterIndex: ${semesterIndex}, curriculumIndex: ${curriculumIndex}, ${curriculumData[curriculumIndex].YearLevels[yearLevelIndex]}, schedIdx: ${sectionSchedIndex}`
    );
  };

  const [subjectColors, setSubjectColors] = useState({});

  /////////////////////////////////////////////////////////////////////////////////
  //                              COMPONENT UI CODE
  /////////////////////////////////////////////////////////////////////////////////

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
            <select className="dropdown" value={departmentID} onChange={handleDepartmentChange}>
              <option value="">Department</option>
              {allDepartment ?
                allDepartment.map((department, index) => (
                  <option key={index} value={department.DepartmentID}>{department.Code}</option>
                )) : null
              }
            </select>

            <select className="dropdown" value={semesterIndex} onChange={handleSemesterChange} disabled={!departmentID}>
              <option value="">Semester</option>
              <option value={0}>1st Semester</option>
              <option value={1}>2nd Semester</option>
            </select>

            <select className="dropdown" value={curriculumIndex} onChange={handleCurriculumChange} disabled={!semesterIndex}>
              <option value="">Course</option>
              {curriculumData ?
                curriculumData.map((curriculum, index) => (
                  <option key={curriculum.CurriculumCode} value={index}>
                    {curriculum.CurriculumCode}
                  </option>
                )) : null
              }
            </select>

            <select className="dropdown" value={yearLevelIndex} onChange={handleYearLevelChange} disabled={!curriculumIndex}>
              <option value="">Year Level</option>
              {curriculumIndex ?
                curriculumData[curriculumIndex].YearLevels.map((year_level, index) => (
                  <option key={index} value={index}>
                    {year_level.Name}
                  </option>
                )) : null
              }
            </select>

            <select className="dropdown" value={sectionSchedIndex} onChange={handleSectionChange} disabled={!yearLevelIndex}>
              <option value="">Section</option>
              {yearLevelIndex ?
                curriculumData[curriculumIndex].YearLevels[yearLevelIndex].Sections.map((section_schedule_index, index) => (
                  <option key={index} value={section_schedule_index}>
                    {`Section ${SECTION_CHARACTERS[index]}`}
                  </option>
                )) : null
              }
            </select>
          </div>
          <button className="all-btns" onClick={handleFetch} disabled={!sectionSchedIndex}>
            fetch schedule
          </button>
        </div>

        {/*================================= TimeTable Table =================================*/}

        <table className="time-table">
          <thead>
            <tr>
              <th className="time-slot-header">Time Slot</th>
              {DAYS.map((day) => (
                <th key={day} className="day-header">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {generateTimeSlotRowLabels(startHour, timeSlotMinuteInterval, dailyTimeSlots).map((time_slot_label, row_idx) => (
              <tr key={row_idx}>
                <td className="time-slot">{time_slot_label}</td>
                {DAYS.map((_, day_idx) => {
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
                  });

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
