// Progress Tracking

  const saved = loadFromStorage("completedSublevels");
  if (saved) {
    Object.keys(saved).forEach(level => {
      if (completedSublevels[level]) {
        Object.keys(saved[level]).forEach(sublevel => {
          completedSublevels[level][sublevel] = saved[level][sublevel];
        });
      }
    });
  }
}

  saveToStorage("completedSublevels", completedSublevels);
}

  const saved = loadFromStorage("completedChallenges");
  if (saved) {
    Object.keys(saved).forEach(challenge => {
      completedChallenges[challenge] = saved[challenge];
    });
  }
}

  saveToStorage("completedChallenges", completedChallenges);
}

  return loadFromStorage("bestEndlessStreak", 0);
}

  saveToStorage("bestEndlessStreak", streak);
}

  return loadFromStorage(`bestTime_${challengeName}`, null);
}

  saveToStorage(`bestTime_${challengeName}`, time);
}
