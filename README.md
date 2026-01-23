# Dashboard

## A dashboard that allows customization through YAML

**NOTE : Currently, this program only Supports Firefox in KDE Plasma. Only use on Firefox in KDE Plasma unless you are willing to spend time to change the code.**

### Developer: @Willgob

### How to operate:

1. Download the repo
2. Download all libraries inside requirements.txt
3. open dashboard.yaml
4. edit dashboard.yaml with whatever you want
5. Please put your api keys in a .env with Hackatime api key name as : HACKATIME_API_KEY and Mail api key as MAIL_API_KEY
6. start the py program
7. go to 127.0.0.1:5050

### Troubleshooting:

#### &nbsp;&nbsp;&nbsp;&nbsp;Port 5050 is taken?

#####     Go into app.py, scroll to the very bottom and change the port to 5000 that should fix it

####     something not working?

#####       Restart the program chances are that fixes it :P

####     Other?

#####       Feel free to contact me at @Willgob

Basic Knowledge on how to run
Inside YAML, Each widget has to have some classes:
Please use the Template below to start of every widget:

```YAML
  - id: type-main
    type: ___
    title: ___
    x: _
    y: _
    width: _
    height: _
```

Make sure the type is one of the vaild ones:

* Links
* todos
* weather
* hackatime
* clock
* timer
* pc_stats
* pc_stats_advanced
* app_launcher
* audio
* volume
* clipboard
* mail

'title' is where you put what title the widget should show it can be anything.
'x' and 'y' is where you want the widget. The display is split into a grid.
'width' and 'height' is pretty self explanatory it is how big you want the widget to be.

### Widgets:

#### 