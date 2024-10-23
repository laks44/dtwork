function printStudentDetails(studentId, name, courseName, semester) {
    console.log("Student ID: " + studentId);
    console.log("Name: " + name);
    console.log("Course Name: " + courseName);
    console.log("Semester: " + semester);
  }
  
  function calculatePercentage(html, css, js) {
    const totalMarks = html + css + js;
    const percentage = (totalMarks / 300) * 100;
    return percentage.toFixed(2); // Returns percentage with 2 decimal places
  }
  
  function calculateGrade(percentage) {
    if (percentage > 90) {
      return "A";
    } else if (percentage > 80) {
      return "B";
    } else if (percentage > 70) {
      return "C";
    } else {
      return "Failed";
    }
  }
  
  function displayMarks(html, css, js) {
    const percentage = calculatePercentage(html, css, js);
    const grade = calculateGrade(percentage);
    
    console.log("HTML Marks: " + html);
    console.log("CSS Marks: " + css);
    console.log("JS Marks: " + js);
    console.log("Total Marks: " + (html + css + js));
    console.log("Percentage: " + percentage + "%");
    console.log("Grade: " + grade);
  }
  
  function studentReport(studentId, name, courseName, semester, html, css, js) {
    printStudentDetails(studentId, name, courseName, semester);
    displayMarks(html, css, js);
  }
  
  // Example usage
  studentReport("12345", "John Doe", "Computer Science", "Fall 2024", 85, 90, 95);
  studentReport("67890", "Jane Smith", "Mechanical Engineering", "Spring 2023", 78, 82, 88);
  studentReport("11223", "Bob Brown", "Electrical Engineering", "Winter 2024", 65, 70, 60);
