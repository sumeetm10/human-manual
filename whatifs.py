"""The Human Manual's "What if...?" library: hypotheticals told through the body.

Each entry: an emoji, the title (also the first line), and beats - one spoken
line each, with the scene that shows it (see WhatIf.tsx). Written by hand;
the numbers are standard physics and physiology, rounded and said with
"about". Sources in the comments. No model writes or changes a fact here.
"""

WHATIFS = {
    "flash": {
        "emoji": "⚡", "title": "What if you could run as fast as the Flash?",
        "beats": [
            ("hook", {}, "What if you could run as fast as the Flash?"),
            # Bolt's top speed, Berlin 2009: 44.72 km/h
            ("run", {"speed": 44, "counter": "44 KM/H", "label": "USAIN BOLT"},
             "The fastest human ever, Usain Bolt, peaked at about 44 kilometers per hour."),
            # speed of sound at sea level, 15 C: 340 m/s = 1,225 km/h
            ("run", {"speed": 1225, "boom": True, "counter": "1,225 KM/H", "label": "SOUND BARRIER"},
             "Now speed up. At about 1,225 kilometers per hour, you break the sound barrier."),
            ("run", {"speed": 1225, "boom": True, "label": "SONIC BOOM"},
             "Every step would set off a sonic boom, loud enough to shatter windows."),
            # strongest measured surface wind: 408 km/h, Barrow Island 1996
            ("run", {"speed": 1225, "counter": "3X", "label": "STRONGEST WIND EVER"},
             "The air hitting you would be three times faster than the strongest wind ever recorded."),
            # stagnation temperature at Mach 3, sea level: about 540 C
            ("run", {"speed": 3700, "heat": 1.0, "counter": "500°C+", "label": "AIR IN FRONT OF YOU"},
             "At three times the speed of sound, the air in front of you would heat past 500 degrees."),
            ("body", {"organ": "heart", "tint": "danger", "label": "SUDDEN STOP"},
             "And if you stopped suddenly, your organs would slam into your ribs."),
            ("body", {"organ": "whole", "tint": "calm"},
             "Super speed is the easy part. Surviving it is the hard part."),
        ],
        "tags": ["what if you could run as fast as the flash", "flash super speed", "super speed science",
                 "speed of sound", "sonic boom"],
    },
    "light": {
        "emoji": "\U0001F4A1", "title": "What if you could travel at the speed of light?",
        "beats": [
            ("hook", {}, "What if you could travel at the speed of light?"),
            ("space", {"target": "light", "counter": "300,000 KM/S"},        # 299,792 km/s
             "Light moves at about 300,000 kilometers every second."),
            ("space", {"target": "orbit", "counter": "7.5 LAPS / SEC"},      # 40,075 km around
             "That's fast enough to circle the Earth seven times in one second."),
            ("space", {"target": "moon", "counter": "1.3 SEC", "label": "TO THE MOON"},  # 1.28 s
             "You'd reach the Moon in about one second."),
            ("space", {"target": "sun", "counter": "8 MIN", "label": "TO THE SUN"},      # 8.3 min
             "And the Sun in just over eight minutes."),
            ("fact", {"fact": {"big": "∞", "small": "energy needed to reach light speed"}},
             "But physics says anything with mass can never actually reach light speed."),
            # gamma at 0.9999 c = 70.7
            ("clock", {"factor": 70, "counter": "70X", "label": "TIME SLOWS DOWN"},
             "Get close, at 99.99 percent, and your time slows down about 70 times."),
            ("clock", {"factor": 70, "counter": "1 YEAR = 70", "label": "YOU VS EARTH"},
             "One year for you would be about 70 years back on Earth."),
        ],
        "tags": ["what if you traveled at the speed of light", "speed of light", "time dilation",
                 "relativity explained", "light speed travel"],
    },
    "no-sleep": {
        "emoji": "\U0001F634", "title": "What happens to your body if you stop sleeping?",
        "beats": [
            ("hook", {}, "What happens to your body if you stop sleeping?"),
            # Dawson & Reid 1997: 24 h awake ~ blood alcohol 0.10%
            ("body", {"organ": "brain", "tint": "danger", "counter": "24 HOURS"},
             "After 24 hours awake, your brain works about as well as a drunk person's."),
            ("body", {"organ": "brain", "label": "MICROSLEEPS"},
             "Your brain starts falling asleep for seconds at a time, without you noticing."),
            ("body", {"organ": "brain", "tint": "danger", "counter": "3 DAYS", "label": "HALLUCINATIONS"},
             "After about three days, many people start to hallucinate."),
            ("body", {"organ": "blood", "label": "IMMUNE SYSTEM"},
             "Your immune system weakens, so you get sick more easily."),
            ("body", {"organ": "heart", "tint": "danger", "label": "HEART"},
             "Your heart rate and blood pressure start to climb."),
            # Randy Gardner, 17, 1964: 11 days 25 minutes
            ("fact", {"fact": {"big": "11 DAYS", "small": "the record, set by a student in 1964"}},
             "The famous record is about 11 days, set by a student in 1964."),
        ],
        "tags": ["what happens if you stop sleeping", "sleep deprivation", "no sleep for days",
                 "what happens to your body without sleep", "sleep facts"],
    },
    "water": {
        "emoji": "\U0001F4A7", "title": "What happens if you drink too much water, too fast?",
        "beats": [
            ("hook", {}, "What happens if you drink too much water, too fast?"),
            # healthy kidneys clear about 0.8-1.0 L of water per hour
            ("body", {"organ": "kidneys", "counter": "1 L / HOUR", "label": "KIDNEYS"},
             "Your kidneys can get rid of only about one liter of water an hour."),
            ("body", {"organ": "blood", "tint": "danger", "label": "BLOOD SALT"},
             "Drink a lot more than that, and the salt in your blood gets watered down."),
            ("body", {"organ": "whole", "tint": "danger", "label": "CELLS SWELL"},
             "Water floods into your cells, and they start to swell."),
            ("body", {"organ": "brain", "tint": "danger", "label": "BRAIN"},
             "Your brain swells too, but your skull has no room to spare."),
            ("fact", {"fact": {"big": "HYPONATREMIA", "small": "water intoxication"}},
             "It's called water intoxication, and it can be deadly."),
            ("body", {"organ": "kidneys", "tint": "calm"},
             "So sip through the day. Your kidneys will thank you."),
        ],
        "tags": ["what happens if you drink too much water", "water intoxication", "hyponatremia",
                 "drinking too much water", "kidneys"],
    },
    "space": {
        "emoji": "\U0001F680", "title": "What happens if you step into space without a suit?",
        "beats": [
            ("hook", {}, "What happens if you step into space without a suit?"),
            # NASA: useful consciousness in vacuum about 15 seconds
            ("body", {"organ": "brain", "tint": "danger", "counter": "15 SEC"},
             "You'd stay conscious for only about 15 seconds."),
            ("body", {"organ": "lungs", "tint": "danger", "label": "LUNGS"},
             "The air would rush out of your lungs, so you must never hold your breath."),
            ("body", {"organ": "skin", "tint": "danger", "label": "SWELLING"},
             "The water in your body starts turning to vapor, and you swell up."),
            ("body", {"organ": "whole", "tint": "cold", "label": "NO EXPLOSION"},
             "But you would not explode, and you would not freeze instantly."),
            # animal studies: survival after up to about 90 s of vacuum
            ("fact", {"fact": {"big": "90 SEC", "small": "to get back to air and survive"}},
             "Get back to air within about 90 seconds, and you could survive."),
        ],
        "tags": ["what happens in space without a suit", "space without spacesuit", "vacuum exposure",
                 "space facts", "astronaut"],
    },
    "ocean": {
        "emoji": "\U0001F30A", "title": "What happens if you dive to the deepest point in the ocean?",
        "beats": [
            ("hook", {}, "What happens if you dive to the deepest point in the ocean?"),
            # Challenger Deep: about 10,935 m
            ("body", {"organ": "whole", "tint": "cold", "counter": "11 KM", "label": "MARIANA TRENCH"},
             "The Mariana Trench goes down almost 11 kilometers."),
            # about 1,086 bar at the bottom
            ("body", {"organ": "lungs", "tint": "danger", "counter": "1,000X", "label": "PRESSURE"},
             "Down there, the water pushes on you over 1,000 times harder than the air does now."),
            ("body", {"organ": "lungs", "tint": "danger", "label": "LUNGS"},
             "The air in your lungs would be squeezed to a tiny fraction of its size."),
            ("body", {"organ": "skin", "tint": "cold", "counter": "1-4°C"},
             "It's pitch black, and the water is just above freezing."),
            ("fact", {"fact": {"big": "FEW DOZEN", "small": "people have ever been there"}},
             "Only a few dozen people have ever been there, all inside special submarines."),
        ],
        "tags": ["what happens at the bottom of the ocean", "mariana trench", "deepest point in the ocean",
                 "ocean pressure", "deep sea"],
    },
    "mars": {
        "emoji": "\U0001FA90", "title": "What would happen to your body if you lived on Mars?",
        "beats": [
            ("hook", {}, "What would happen to your body if you lived on Mars?"),
            ("body", {"organ": "whole", "counter": "38%", "label": "MARS GRAVITY"},      # 0.38 g
             "Mars has only about 38 percent of Earth's gravity."),
            ("body", {"organ": "whole", "tint": "calm", "counter": "2.5X", "label": "HIGHER JUMPS"},
             "You could jump about two and a half times higher than on Earth."),
            ("body", {"organ": "blood", "tint": "danger", "label": "BONES AND MUSCLES"},
             "But with less weight to carry, your bones and muscles would slowly weaken."),
            ("body", {"organ": "skin", "tint": "danger", "label": "RADIATION"},
             "Mars has almost no magnetic field, so space radiation would hit you far harder."),
            ("body", {"organ": "lungs", "tint": "danger", "counter": "95% CO₂"},
             "And its thin air is mostly carbon dioxide, so you could never breathe it."),
        ],
        "tags": ["what would happen if you lived on mars", "living on mars", "mars gravity",
                 "human body on mars", "space facts"],
    },
    "black-hole": {
        "emoji": "\U0001F573️", "title": "What happens if you fall into a black hole?",
        "beats": [
            ("hook", {}, "What happens if you fall into a black hole?"),
            ("space", {"target": "flash", "label": "TIDAL FORCES"},
             "Near a small black hole, gravity pulls far harder on your feet than on your head."),
            ("body", {"organ": "whole", "tint": "danger", "label": "SPAGHETTIFICATION"},
             "You'd be stretched thin like a noodle. Scientists really call it spaghettification."),
            ("clock", {"factor": 24, "label": "TIME AT THE EDGE"},
             "A friend watching from far away would see you slow down and freeze at the edge."),
            ("space", {"target": "light", "label": "FADING TO RED"},
             "Your image would fade to red, and then disappear."),
            ("body", {"organ": "whole", "tint": "calm", "label": "GIANT BLACK HOLE"},
             "But at a giant black hole, you might cross the edge without feeling anything at first."),
        ],
        "tags": ["what happens if you fall into a black hole", "black hole", "spaghettification",
                 "black hole explained", "space facts"],
    },
}
