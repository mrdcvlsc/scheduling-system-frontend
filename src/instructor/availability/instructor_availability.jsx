import { StrictMode, useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

import { Loading, Popup } from "../../components/Loading";

import "../../assets/main.css";
import "./TimeTable.css";
import "./TimeTableDropdowns.css";
import "./instructor_availability.css";

import { fetch_all_departments, fetch_department_instructors_erd, fetch_department_instructors_era } from "../../js/schedule"
import { generateTimeSlotRowLabels } from "../../js/week-time-table-grid-functions";
import { InstructorTimeSlotBitMap } from "../../js/instructor-time-slot-bit-map"

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
  const [instructorERD, setInstructorERD] = useState([]);                // fetch on page load
  const [instructorERA, setInstructorERA] = useState([]);                // fetch on page load

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
  //                       SELECTED INSTRUCTORS
  /////////////////////////////////////////////////////////////////////////////////

  const [instructorIndex, setInstructorIndex] = useState("")
  const [instructor, setInstructor] = useState("")

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

      const all_departments = await fetch_all_departments();


      setAllDepartment(all_departments);
      console.log('all_departments')
      console.log(all_departments);
      console.log()


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

    try {
      setIsLoading(true);

      const instructors_erd = await fetch_department_instructors_erd(departmentID, event.target.value);
      const instructors_era = await fetch_department_instructors_era(departmentID, event.target.value);

      setInstructorERD(instructors_erd)
      console.log('instructors_erd')
      console.log(instructors_erd);
      console.log()

      setInstructorERA(instructors_era)
      console.log('instructors_era')
      console.log(instructors_era);
      console.log()

      setIsLoading(false);
    } catch (err) {
      setPopupOptions({
        Heading: "Failed to fetch instructor encoding resources",
        HeadingStyle: { background: "red", color: "white" },
        Message: `${err}`
      });
      setIsLoading(false);
      setSemesterIndex("");
    }
  };

  const handleInstructorSelection = (selected_index) => {
    console.log('selected instructor index =', selected_index)
    setInstructorIndex(selected_index)
    setInstructor(instructorERA[selected_index])
  }

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
          </div>
          <button className="fetch-button" onClick={handleFetch} disabled={!sectionSchedIndex}>
            fetch schedule
          </button>
        </div>

        <div className="instructor-list">
          {instructorERA?.map((instructor, index) => (
            <div
              key={index}
              className={`instructor-item ${instructorIndex === index ? "selected" : ""}`}
              onClick={() => handleInstructorSelection(index)}
            >
              {`${instructor.LastName}, ${instructor.FirstName} ${instructor.MiddleInitial}.`}
            </div>
          ))}
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
            {generateTimeSlotRowLabels(startHour, timeSlotMinuteInterval, dailyTimeSlots).map((time_slot_label, time_slot_index) => (
              <tr key={time_slot_index}>
                <td className="time-slot">{time_slot_label}</td>
                {DAYS.map((_, day_index) => {
                  const is_available_time_slot = (new InstructorTimeSlotBitMap(instructor.Time)).getAvailability(day_index, time_slot_index)

                  if (is_available_time_slot) {
                    return (
                      <td key={day_index} className="empty-slot" onClick={() => {
                        const available = (new InstructorTimeSlotBitMap(instructor.Time)).getAvailability(day_index, time_slot_index)
                        console.log(`day(${day_index}), time_slot(${time_slot_index} = available? ${available})`)
                      }}/>
                    );
                  }

                  return <td key={day_index} className="occupied-slot" onClick={() => {
                    const available = (new InstructorTimeSlotBitMap(instructor.Time)).getAvailability(day_index, time_slot_index)
                    console.log(`day(${day_index}), time_slot(${time_slot_index} = available? ${available})`)
                  }}></td>;
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
