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

  /////////////////////////////////////////////////////////////////////////////////
  //                       DROPDOWN SELECTION STATES
  /////////////////////////////////////////////////////////////////////////////////

  const [departmentID, setDepartmentID] = useState("");
  const [semesterIndex, setSemesterIndex] = useState("");

  /////////////////////////////////////////////////////////////////////////////////
  //                       SELECTED INSTRUCTORS
  /////////////////////////////////////////////////////////////////////////////////

  const [instructorIndex, setInstructorIndex] = useState("")
  const [instructorAlloc, setInstructorAlloc] = useState("")
  const [instructorDefault, setInstructorDefault] = useState("")

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
  }

  const handleSemesterChange = async (event) => {
    console.log(`selected semesterIndex: ${event.target.value}`);
    setSemesterIndex(event.target.value);

    try {
      setIsLoading(true);

      const instructors_erd = await fetch_department_instructors_erd(departmentID, event.target.value);
      const instructors_era = await fetch_department_instructors_era(departmentID, event.target.value);

      for (let i = 0; i < instructors_erd.length; i++) {
        instructors_erd[i].Time = new InstructorTimeSlotBitMap(instructors_erd[i].Time);
      }

      for (let i = 0; i < instructors_era.length; i++) {
        instructors_era[i].Time = new InstructorTimeSlotBitMap(instructors_era[i].Time);
      }

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
    console.log('instructorERD[selected_index].Time:')
    console.log(instructorERD[selected_index].Time)

    let allocated_instructors_idx = -1

    for (let i = 0; i < instructorERD.length; i++) {
      if (instructorERD[i].InstructorID === instructorERA[selected_index].InstructorID) {
        allocated_instructors_idx = i
        break
      }
    }

    if (allocated_instructors_idx < 0) {
      setPopupOptions({
        Heading: "Incorrect Data",
        HeadingStyle: { background: "red", color: "white" },
        Message: "missing default instructor encoding resources"
      });
    }

    setInstructorIndex(selected_index)
    setInstructorDefault(instructorERD[selected_index])
    setInstructorAlloc(instructorERA[allocated_instructors_idx])
  }

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
        </div>

        <div className="instructor-list-container">
          <div className="instructor-list">
            <h2>General Instructors</h2>
            <div className="instructor-list-items">
              {instructorERD?.map((instructor, index) => {
                if (instructor.DepartmentID === 0) {
                  return <div
                    key={index}
                    className={`instructor-item ${instructorIndex === index ? "selected" : ""}`}
                    onClick={() => handleInstructorSelection(index)}
                  >
                    <div className="instructor-ids">{`${instructor.InstructorID}`}</div>
                    <div className="instructor-names">{`${instructor.LastName}, ${instructor.FirstName} ${instructor.MiddleInitial}.`}</div>
                  </div>
                } else {
                  return null
                }
              })}
            </div>
          </div>

          <div className="instructor-list">
            <h2>Department Instructors</h2>
            <div className="instructor-list-items">
              {instructorERD?.map((instructor, index) => {
                if (instructor.DepartmentID === Number(departmentID)) {
                  return <div
                    key={index}
                    className={`instructor-item ${instructorIndex === index ? "selected" : ""}`}
                    onClick={() => handleInstructorSelection(index)}
                  >
                    <div className="instructor-ids">{`${instructor.InstructorID}`}</div>
                    <div className="instructor-names">{`${instructor.LastName}, ${instructor.FirstName} ${instructor.MiddleInitial}.`}</div>
                  </div>
                } else {
                  return null
                }
              })}
            </div>
          </div>

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
                  if (instructorDefault) {
                    const is_enabled_time_slot = instructorDefault.Time.getAvailability(day_index, time_slot_index)

                    if (!is_enabled_time_slot) {
                      return <td key={day_index} className="disabled-slot" onClick={() => {
                        const available = instructorAlloc.Time.getAvailability(day_index, time_slot_index)
                        console.log(`day(${day_index}), time_slot(${time_slot_index} = available? ${available})`)
                      }} />
                    }

                    if (instructorAlloc) {
                      const is_available_time_slot = instructorAlloc.Time.getAvailability(day_index, time_slot_index)

                      if (!is_available_time_slot) {
                        return <td key={day_index} className="occupied-slot" onClick={() => {
                          const available = instructorAlloc.Time.getAvailability(day_index, time_slot_index)
                          console.log(`day(${day_index}), time_slot(${time_slot_index} = available? ${available})`)
                        }}></td>;
                      }

                      return (
                        <td key={day_index} className="available-slot" onClick={() => {
                          const available = instructorAlloc.Time.getAvailability(day_index, time_slot_index)
                          console.log(`day(${day_index}), time_slot(${time_slot_index} = available? ${available})`)
                        }} />
                      );
                    }
                  } else {
                    return <td key={day_index} className="disabled-slot" />
                  }
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
