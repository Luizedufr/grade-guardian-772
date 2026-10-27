import {
  IconBook, IconCalculator, IconFlask, IconAtom, IconMicroscope, IconWorld,
  IconScale, IconBriefcase, IconChartBar, IconCode, IconCpu, IconPalette,
  IconMusic, IconCamera, IconHeartbeat, IconBallFootball, IconPlant, IconSchool,
  IconLanguage, IconBuildingBank, IconMathFunction, IconPencil, IconStar, IconDeviceLaptop,
} from "@tabler/icons-react";

export const classIcons = {
  book: IconBook, calculator: IconCalculator, flask: IconFlask, atom: IconAtom,
  microscope: IconMicroscope, world: IconWorld, scale: IconScale, briefcase: IconBriefcase,
  chart: IconChartBar, code: IconCode, cpu: IconCpu, palette: IconPalette,
  music: IconMusic, camera: IconCamera, heartbeat: IconHeartbeat, football: IconBallFootball,
  plant: IconPlant, school: IconSchool, language: IconLanguage, bank: IconBuildingBank,
  math: IconMathFunction, pencil: IconPencil, star: IconStar, laptop: IconDeviceLaptop,
} as const;

export function getClassIcon(id?: string) {
  return id && Object.hasOwn(classIcons, id) ? classIcons[id as keyof typeof classIcons] : undefined;
}