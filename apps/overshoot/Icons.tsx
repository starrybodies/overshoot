'use client';
import {ShovelIcon} from '@phosphor-icons/react/dist/csr/Shovel';
import {FlowArrowIcon} from '@phosphor-icons/react/dist/csr/FlowArrow';
import {BuildingsIcon} from '@phosphor-icons/react/dist/csr/Buildings';
import {TrashIcon} from '@phosphor-icons/react/dist/csr/Trash';
import {ArrowsClockwiseIcon} from '@phosphor-icons/react/dist/csr/ArrowsClockwise';
import {PlantIcon} from '@phosphor-icons/react/dist/csr/Plant';
import {FlameIcon} from '@phosphor-icons/react/dist/csr/Flame';
import {CubeIcon} from '@phosphor-icons/react/dist/csr/Cube';
import {MountainsIcon} from '@phosphor-icons/react/dist/csr/Mountains';
import type {Scene,Material} from '@/packages/overshoot-data/types';
const sceneIcons={extraction:ShovelIcon,flow:FlowArrowIcon,stock:BuildingsIcon,discard:TrashIcon,return:ArrowsClockwiseIcon};
const materialIcons={biomass:PlantIcon,fossil:FlameIcon,metals:CubeIcon,minerals:MountainsIcon};
export function SceneIcon({scene,size=24}:{scene:Scene;size?:number}){const Icon=sceneIcons[scene];return <Icon size={size} weight="duotone" aria-hidden="true"/>}
export function MaterialIcon({material,size=24}:{material:Exclude<Material,'all'>;size?:number}){const Icon=materialIcons[material];return <Icon size={size} weight="duotone" aria-hidden="true"/>}
