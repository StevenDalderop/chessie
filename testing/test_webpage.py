import os
import pathlib
import unittest
import time
import application

from selenium import webdriver

# Finds the Uniform Resourse Identifier of a file 
def file_uri(filename):
    # return pathlib.Path(os.path.abspath(filename)).as_uri()
    return filename

# Sets up web driver using Google chrome 
driver = webdriver.Chrome(executable_path="C:/Users/Steven/Documents/Python/chess/venv2/Lib/site-packages/chromedriver_py/chromedriver_win32.exe")

file_uri = "http://127.0.0.1:5000"


class WebpageTests(unittest.TestCase):
    def test_title(self):
        """Make sure title is correct"""
        driver.get(file_uri)
        self.assertEqual(driver.title, "Chess")

    def test_username(self):
        driver.get(file_uri)
        username = driver.find_element_by_id("username")
        username.clear()
        username.send_keys("Mario")
        driver.find_element_by_id("submit_username_button").click() 
        self.assertEqual(driver.find_element_by_id("username_below").get_attribute('innerHTML'), " Mario ")

    def test_new_game_vs_human(self): 
        driver.get(file_uri)
        username = driver.find_element_by_id("username")
        username.clear()
        username.send_keys("Henk")
        driver.find_element_by_id("submit_username_button").click() 
        driver.find_element_by_id("button_new_game").click()
        driver.find_element_by_id("vs_human").click()
        driver.find_element_by_id("time_600").click()
        self.assertEqual(driver.find_element_by_class_name('times').get_attribute('innerHTML'), " 10:00 ")
        driver.find_element_by_id("E2").click()
        driver.find_element_by_id("E4").click()
        time.sleep(2)
        self.assertEqual(driver.find_element_by_id('list').get_attribute('innerHTML'), "1. e4")
        self.assertGreater(int(driver.find_element_by_id('text').get_attribute('innerHTML').split(": ")[1]), 0)
        self.assertIn(driver.find_element_by_class_name('times').get_attribute('innerHTML'), [" 9:59 ", " 9:58 "])
        driver.find_element_by_id("E7").click()
        driver.find_element_by_id("E5").click()
        time.sleep(2)
        self.assertEqual(driver.find_element_by_id('list').get_attribute('innerHTML'), "1. e4 e5")
        self.assertIn(driver.find_element_by_class_name('times').get_attribute('innerHTML'), [" 9:59 ", " 9:58 "])
        self.assertIn(driver.find_element_by_id('time_above').get_attribute('innerHTML'), [" 9:59 ", " 9:58 "])

    


if __name__ == "__main__":
    unittest.main()