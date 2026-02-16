import "server-only";
import { prisma } from "./prisma";

export const getAllPhotographers = () => prisma.photographer.findMany();

export const getPhotographer = (id: number) =>
  prisma.photographer.findUnique({
    where: { id },
  });

export const getAllMediasForPhotographer = (photographerId: number) =>
  prisma.media.findMany({
    where: { photographerId },
  });

export const updateNumberOfLikes = (mediaId: number, newNumberOfLikes: number) =>
  prisma.media.update({
    where: { id: mediaId },
    data: { likes: newNumberOfLikes },
  });