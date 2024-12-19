import React, { useState, useRef } from 'react';
import { Editor } from '@toast-ui/react-editor'; // Toast UI Editor import
import '@toast-ui/editor/dist/toastui-editor.css'; 
import '@toast-ui/editor/dist/i18n/ko-kr';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";  // 스타일 불러오기
import { ko } from 'date-fns/locale'; // 한국어 locale 추가
import { useIsRTL } from 'react-bootstrap/esm/ThemeProvider';


const TodoModify = () => {
    const [taskDescription, setTaskDescription] = useState('');
    const [calendarVisible, setCalendarVisible] = useState(false); 
    const [priorityVisible, setPriorityVisible] = useState(false); 
    const [selectedDate, setSelectedDate] = useState(null);
    const [priority, setPriority] = useState(0);
    const editorRef = useRef(null); // 에디터 참조

    const handleTaskDescriptionChange = () => {
      const htmlContent = editorRef.current.getInstance().getHTML();
      setTaskDescription(htmlContent); 
    };

    const handleClickCalendar = () => {
        setCalendarVisible(!calendarVisible); // 캘린더 토글
    };

    const handleClickPriority = () => {
        setPriorityVisible(!priorityVisible); 
    };

    const handleDateChange = (date) => {
        if (date) {
            const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
            setSelectedDate(formattedDate); // 상태에 저장
            console.log(`선택된 날짜: ${formattedDate}`); // 서버로 보낼 값
        }
    };

    const modifyToDo = async (id) =>{
        try{    
            const modifyData = {
                title : document.querySelector("#modify-title").value,
                description : taskDescription,
                date : selectedDate,
                priority : priority,
            }

            const response = await fetch(`http://localhost:8081/to-do/${id}`,{
                method : "PUT",
                credentials: 'include',
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify(modifyData)
            });

            if(response.ok){
                alert('수정 완료')
            }
        

        }catch(error){
            console.log(error)
            alert('서버 오류로 수정에 실패했습니다.');
        }
    }

    window.addEventListener('dataFetched', (event) => {
        const data = event.detail;

        document.querySelector("#section-modify").style.display = "block";
        document.querySelector("#btn-modify").value = data.id

        document.querySelector("#modify-title").value = data.title
        setTaskDescription(data.description);
        setSelectedDate(data.date);
        setPriority(data.priority || 0); 
        
        setCalendarVisible(false);
        setPriorityVisible(false);

        if (editorRef.current) {
            editorRef.current.getInstance().setHTML(data.description);
        }
    });

    return (
    <div id="section-modify" style={{display:'none'}}>
        <div style={{display:'flex', paddingBottom:'10px', justifyContent:'space-between'}}>
            <div>
                <span onClick={handleClickCalendar} style={{ cursor: 'pointer' }}>📅</span>
                <span style={{margin:'0 10px'}}>|</span>
                <span onClick={handleClickPriority} style={{cursor: 'pointer'}}>🚩</span>
                {priorityVisible && (
                    <input 
                    type="number"
                    id='priority'
                    style={{
                        width: `${Math.max(5, priority.toString().length+3)}ch`,
                        position: 'absolute', 
                        marginLeft: '10px'
                    }}
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    />
                )}
            </div>
            <div>
                <button type="button" id="btn-modify" className='btn-modify' onClick={(e) => modifyToDo(e.target.value)}>수정</button>
            </div>
        </div>
        {calendarVisible && (
            <div 
            style={{
                position: 'absolute', 
                zIndex: 9999, 
                backgroundColor: 'white', 
                border: '1px solid #ccc', 
                borderRadius: '5px', 
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', 
                padding: '10px', 
            }}
            >
            <DatePicker
                locale={ko}
                selected={selectedDate ? new Date(selectedDate) : null} 
                onChange={handleDateChange} 
                inline
            />
            </div>
        )}
        
        <div className="mb-3">
            <input
              type="text"
              id="modify-title"
              className="form-control"
            />
        </div>
        <Editor
            ref={editorRef}
            value={taskDescription}
            onChange={handleTaskDescriptionChange}
            previewStyle="vertical" 
            height="80vh"
            width="100%"
            initialEditType="wysiwyg"
            language="ko-KR" 
            hideModeSwitch={true}
            toolbarItems={[
                ['bold', 'italic', 'strike'], 
                ['ul', 'ol', 'task', 'indent', 'outdent'], 
                ['hr', 'quote'], 
                ['link'] 
            ]}
        />
    </div>
  );
};

export default TodoModify;
