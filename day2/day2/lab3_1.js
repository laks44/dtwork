let month = "October"; 

let season;

switch(month) {
  case "December":
  case "January":
  case "February":
    season = "Winter";
    break;
  case "March":
  case "April":
  case "May":
    season = "Spring";
    break;
  case "June":
  case "July":
  case "August":
    season = "Summer";
    break;
  case "September":
  case "October":
  case "November":
    season = "Autumn";
    break;
  default:
    season = "Unknown";
}

console.log("The current season is: " + season);
