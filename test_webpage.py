import os
import pathlib
import unittest
import time

from selenium import webdriver

# Finds the Uniform Resourse Identifier of a file 
def file_uri(filename):
    # return pathlib.Path(os.path.abspath(filename)).as_uri()
    return filename

# Sets up web driver using Google chrome 
driver = webdriver.Chrome(executable_path="C:/Users/Steven/Documents/Python/chess/venv2/Lib/site-packages/chromedriver_py/chromedriver_win32.exe")

# Find the URI of our newly created file
#uri = file_uri("127.0.0.1:5000")
file_uri = "http://127.0.0.1:5000"

# Use the URI to open the web page 
#driver.get(uri)

# Access the title of the current page
#print(driver.title)

# Access the source code of the page
#print(driver.page_source)

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

if __name__ == "__main__":
    unittest.main()