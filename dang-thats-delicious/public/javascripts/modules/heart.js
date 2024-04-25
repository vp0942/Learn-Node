import axios from "axios";
import { $ } from "./bling";

function ajaxHeart(e) {
  // We prevent the form from submitting and the page from reloading
  // We will handle everything with javascript and will use axios to send a POST request to the server instead
  // with ajax call we can update the UI without refreshing the page !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  e.preventDefault();

  // console.log("HEARTED!!!");
  // console.log(this); // this is the form.heart with action=`/api/stores/${store._id}/heart`. After hittind the route
                     // it will reach storeController.heartStore and will return a user object with the updated hearts array
  axios
    .post(this.action)
    .then(res => {
      // console.log(res.data); // the user object with the updated hearts array !!!
      // this.heart is the button.heart__button(type='submit' name='heart' class=heartClass) with name='heart'!!!
      const isHearted = this.heart.classList.toggle("heart__button--hearted"); // toggle the class and return true or false
      // console.log(isHearted); // true or false

      // The heart-count element is a span.heart-count with the number of hearts
      $(".heart-count").textContent = res.data.hearts.length;
      // document.querySelector(".heart-count").textContent = res.data.hearts.length;

      // // If the heart was hearted, we add the animation class and remove it after 2.5 seconds
      // if (isHearted) {
      //   this.heart.classList.add("heart__button--float"); // add the animation
      //   setTimeout(() => this.heart.classList.remove("heart__button--float"), 2500); // stop the animation after 2.5 seconds
      // }
    })
    .catch(console.error);
}

export default ajaxHeart;