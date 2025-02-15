import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { Loading, Popup } from "../components/Loading";

import "../assets/main.css";
import "./TimeTable.css";
import "./TimeTableDropdowns.css";
import "./instructors.css";

import { fetch_all_departments, fetch_department_instructors_erd, fetch_department_instructors_era, post_update_insturctor } from "../js/schedule"
import { generateTimeSlotRowLabels } from "../js/week-time-table-grid-functions";
import { InstructorTimeSlotBitMap } from "../js/instructor-time-slot-bit-map"
import { ContextMenu, ContextMenuItem, Position, useContextMenuState } from "../components/ContextMenu";

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

  const [allDepartment, setAllDepartment] = useState([]); // fetch on page load
  const [instructorsERD, setInstructorsERD] = useState([]); // fetch on page load
  const [instructorsERA, setInstructorsERA] = useState([]); // fetch on page load

  /////////////////////////////////////////////////////////////////////////////////
  //                       DROPDOWN SELECTION STATES
  /////////////////////////////////////////////////////////////////////////////////

  const [departmentID, setDepartmentID] = useState("");
  const [semesterIndex, setSemesterIndex] = useState("");

  /////////////////////////////////////////////////////////////////////////////////
  //                       SELECTED INSTRUCTORS
  /////////////////////////////////////////////////////////////////////////////////

  const [selectedInstructorIndex, setSelectedInstructorIndex] = useState("")
  const [selectedInstructorAlloc, setSelectedInstructorAlloc] = useState("")
  const [selectedInstructorDefault, setSelectedInstructorDefault] = useState("")

  /////////////////////////////////////////////////////////////////////////////////
  //                       SELECTED TIME SLOT CELL
  /////////////////////////////////////////////////////////////////////////////////

  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set())
  const [isDragSelect, setIsDragSelect] = useState()

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

    setInstructorsERD([])
    setInstructorsERA([])

    setSelectedInstructorIndex("")
    setSelectedInstructorAlloc("")
    setSelectedInstructorDefault("")

    setSelectedTimeSlots(new Set([]))
  }

  const handleSemesterChange = async (event) => {
    console.log(`selected semesterIndex: ${event.target.value}`);
    setSemesterIndex(event.target.value);
    setSelectedTimeSlots(new Set([]))

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

      setInstructorsERD(instructors_erd)
      console.log('instructors_erd')
      console.log(instructors_erd);
      console.log()

      setInstructorsERA(instructors_era)
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

  const handleInstructorSelection = (instructor_erd_index) => {
    setSelectedTimeSlots(new Set([]))

    let allocated_instructors_idx = -1

    for (let i = 0; i < instructorsERA.length; i++) {
      if (instructorsERD[instructor_erd_index].InstructorID === instructorsERA[i].InstructorID) {
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
    } else {
      setSelectedInstructorIndex(instructor_erd_index)
      setSelectedInstructorDefault(instructorsERD[instructor_erd_index])
      setSelectedInstructorAlloc(instructorsERA[allocated_instructors_idx])

      console.log('selected instructor index =', instructor_erd_index)

      console.log('instructorERD[selected_index].Time :')
      console.log(instructorsERD[instructor_erd_index])

      console.log('instructorsERA[allocated_instructors_idx] :')
      console.log(instructorsERA[allocated_instructors_idx])
    }
  }

  /////////////////////////////////////////////////////////////////////////////////
  //                     TIME SLOT SELECTION BUTTON HANDLERS
  /////////////////////////////////////////////////////////////////////////////////

  const handleApplyTimeSlotDefaultChanges = async () => {
    try {

      let new_default_time = []

      for (let i = 0; i < selectedInstructorDefault.Time.bitset.length; i++) {
        new_default_time.push(`${selectedInstructorDefault.Time.bitset[i]}`)
      }

      const updated_instructor_time_str = {
        InstructorID: selectedInstructorDefault.InstructorID,
        DepartmentID: selectedInstructorDefault.DepartmentID,
        FirstName: selectedInstructorDefault.FirstName,
        MiddleInitial: selectedInstructorDefault.MiddleInitial,
        LastName: selectedInstructorDefault.LastName,
        Time: new_default_time,
      }

      setIsLoading(true);

      await post_update_insturctor(updated_instructor_time_str);
      
      setIsLoading(false);

    } catch (err) {
      setPopupOptions({
        Heading: "Instructor Update Failed",
        HeadingStyle: { background: "red", color: "white" },
        Message: `${err}`
      });
      setIsLoading(false);
    }
  }

  const handleContextMenuEnable = () => {
    console.log('before enable =', selectedInstructorDefault)

    for (const value of selectedTimeSlots) {
      let [day, time_slot] = value.split(":")

      day = Number(day)
      time_slot = Number(time_slot)

      if (!selectedInstructorDefault?.Time?.getAvailability(day, time_slot)) {
        selectedInstructorDefault.Time.setAvailability(true, day, time_slot)
        selectedInstructorAlloc.Time.setAvailability(true, day, time_slot)
      }
    }

    setSelectedInstructorAlloc(selectedInstructorAlloc)
    setSelectedInstructorDefault(selectedInstructorDefault)

    setSelectedTimeSlots(new Set())
  }

  const handleContextMenuDisable = () => {
    console.log('before disable =', selectedInstructorDefault)

    for (const value of selectedTimeSlots) {
      let [day, time_slot] = value.split(":")

      day = Number(day)
      time_slot = Number(time_slot)

      if (selectedInstructorDefault?.Time?.getAvailability(day, time_slot)) {
        selectedInstructorDefault.Time.setAvailability(false, day, time_slot)
        selectedInstructorAlloc.Time.setAvailability(false, day, time_slot)
      }
    }

    setSelectedInstructorAlloc(selectedInstructorAlloc)
    setSelectedInstructorDefault(selectedInstructorDefault)

    setSelectedTimeSlots(new Set())
  }

  /////////////////////////////////////////////////////////////////////////////////
  //                              COMPONENT UI CODE
  /////////////////////////////////////////////////////////////////////////////////

  const contextMenuState = useContextMenuState()

  return (
    <>
      <ContextMenu
        closeAfterClick={true}
        conextMenuState={contextMenuState}
      >
        <ContextMenuItem onClick={handleContextMenuEnable}>Enable</ContextMenuItem>
        <ContextMenuItem onClick={handleContextMenuDisable}>Disable</ContextMenuItem>
      </ContextMenu>

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
              {instructorsERD?.map((instructor, index) => {
                if (instructor.DepartmentID === 0) {
                  return <div
                    key={index}
                    className={`instructor-item ${selectedInstructorIndex === index ? "selected" : ""}`}
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
              {instructorsERD?.map((instructor, index) => {
                if (instructor.DepartmentID === Number(departmentID)) {
                  return <div
                    key={index}
                    className={`instructor-item ${selectedInstructorIndex === index ? "selected" : ""}`}
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

        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", paddingInline: "1em" }}>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "0.6em" }}>
            <p>time slot drag select </p>
            {isDragSelect ?
              <div style={{ width: "0.8em", height: "0.8em", background: "green" }}></div> :
              <div style={{ width: "0.8em", height: "0.8em", background: "red" }}></div>
            }
          </div>
          <div style={{ display: "flex", gap: "0.8em" }}>
            <button className="all-btns" onClick={() => setSelectedTimeSlots(new Set([]))}>Clear Time Slot Selection</button>
            <button className="all-btns" onClick={handleApplyTimeSlotDefaultChanges}>Apply Changes</button>
            <button className="all-btns">Cancel</button>
          </div>
        </div>

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
                  let class_name = ""
                  let selected = ""

                  const is_available_default = selectedInstructorDefault?.Time?.getAvailability(day_index, time_slot_index) ? true : false
                  const is_available_alloc = selectedInstructorAlloc?.Time?.getAvailability(day_index, time_slot_index) ? true : false

                  if (!is_available_default) {
                    class_name = "disabled-slot"
                  } else if (is_available_default && !is_available_alloc) {
                    class_name = "occupied-slot"
                  } else {
                    class_name = "available-slot"
                  }

                  if (selectedTimeSlots?.has(`${day_index}:${time_slot_index}`)) {
                    selected = "selected-time-slot-cell"
                  }

                  return (
                    <td
                      key={day_index}
                      className={class_name}

                      onContextMenu={(event) => {
                        event.preventDefault()
                        console.log(`right click: class="${event.target.className}"`)

                        const available = selectedInstructorAlloc?.Time?.getAvailability(day_index, time_slot_index)
                        console.log(`day(${day_index}), time_slot(${time_slot_index} = available? ${available})`)

                        contextMenuState.setShow(true)
                        contextMenuState.setPosition(new Position(event.clientX, event.clientY))

                        const is_selected = selectedTimeSlots.has(`${day_index}${time_slot_index}`)

                        if (!is_selected) {
                          const new_selected_time_slots = new Set(selectedTimeSlots)
                          new_selected_time_slots.add(`${day_index}:${time_slot_index}`)
                          setSelectedTimeSlots(new_selected_time_slots)
                          console.log(new_selected_time_slots)
                        }
                      }}

                      onMouseDown={(event) => {
                        console.log(`drag start: class="${event.target.className}"`)
                        setIsDragSelect(true)

                        const is_selected = selectedTimeSlots.has(`${day_index}${time_slot_index}`)

                        if (!is_selected) {
                          const new_selected_time_slots = new Set(selectedTimeSlots)
                          new_selected_time_slots.add(`${day_index}:${time_slot_index}`)
                          setSelectedTimeSlots(new_selected_time_slots)
                          console.log(new_selected_time_slots)
                        }
                      }}

                      onMouseEnter={(event) => {
                        console.log(`dragging: class="${event.target.className}"`)

                        const is_selected = selectedTimeSlots.has(`${day_index}${time_slot_index}`)

                        if (!is_selected && isDragSelect) {
                          const new_selected_time_slots = new Set(selectedTimeSlots)
                          new_selected_time_slots.add(`${day_index}:${time_slot_index}`)
                          setSelectedTimeSlots(new_selected_time_slots)
                          console.log(new_selected_time_slots)
                        }
                      }}

                      onMouseUp={(event) => {
                        console.log(`drag end: class="${event.target.className}"`)
                        setIsDragSelect(false)
                      }}
                    >
                      <span className={`time-slot-cover ${selected}`}></span>
                    </td>
                  )
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
